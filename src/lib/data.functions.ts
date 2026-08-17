import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

/* ---------------------------------- profile --------------------------------- */

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        full_name: z.string().max(120).optional(),
        avatar_url: z.string().max(500).optional(),
        default_tone: z.string().max(40).optional(),
        default_language: z.string().max(40).optional(),
        preferred_style: z.string().max(120).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Record<
      string,
      string
    >;
    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...clean })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/* --------------------------------- projects --------------------------------- */

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        search: z.string().max(120).optional(),
        status: z.string().max(30).optional(),
        sort: z.enum(["updated_at", "created_at", "name"]).default("updated_at"),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("projects").select("*").eq("user_id", context.userId);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q.order(data.sort, { ascending: data.sort === "name" });
    if (error) throw new Error(error.message);
    return rows;
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) return null;
    const { data: items, error: itemsError } = await context.supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", data.id)
      .order("created_at", { ascending: false });
    if (itemsError) throw new Error(itemsError.message);
    return { project, items: items ?? [] };
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().min(1).max(120),
        description: z.string().max(2000).optional(),
        status: z.string().max(30).default("draft"),
        tags: z.array(z.string().max(30)).max(12).default([]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name,
      description: data.description ?? null,
      status: data.status,
      tags: data.tags,
      user_id: context.userId,
      ...(data.id ? { id: data.id } : {}),
    };
    const { data: row, error } = await context.supabase
      .from("projects")
      .upsert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- prompts --------------------------------- */

export const listPrompts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        search: z.string().max(120).optional(),
        category: z.string().max(40).optional(),
        favoritesOnly: z.boolean().default(false),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("prompts").select("*").eq("user_id", context.userId);
    if (data.search) q = q.or(`title.ilike.%${data.search}%,original_prompt.ilike.%${data.search}%`);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    if (data.favoritesOnly) q = q.eq("is_favorite", true);
    const { data: rows, error } = await q.order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const savePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: uuid.optional(),
        title: z.string().min(1).max(140),
        category: z.string().max(40).default("General"),
        description: z.string().max(600).optional(),
        original_prompt: z.string().min(1).max(8000),
        optimized_prompt: z.string().max(8000).optional(),
        improvements: z.string().max(4000).optional(),
        tags: z.array(z.string().max(30)).max(12).default([]),
        is_favorite: z.boolean().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description ?? null,
      original_prompt: data.original_prompt,
      optimized_prompt: data.optimized_prompt ?? null,
      improvements: data.improvements ?? null,
      tags: data.tags,
      user_id: context.userId,
      ...(data.is_favorite === undefined ? {} : { is_favorite: data.is_favorite }),
      ...(data.id ? { id: data.id } : {}),
    };
    const { data: row, error } = await context.supabase.from("prompts").upsert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const togglePromptFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid, value: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("prompts")
      .update({ is_favorite: data.value })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markPromptUsed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("prompts")
      .select("use_count")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase
      .from("prompts")
      .update({ use_count: (row?.use_count ?? 0) + 1 })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("prompts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- content --------------------------------- */

export const listContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).default(50),
        contentType: z.string().max(30).optional(),
        search: z.string().max(120).optional(),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("generated_content").select("*").eq("user_id", context.userId);
    if (data.contentType && data.contentType !== "all") q = q.eq("content_type", data.contentType);
    if (data.search) q = q.or(`title.ilike.%${data.search}%,body.ilike.%${data.search}%`);
    const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(data.limit);
    if (error) throw new Error(error.message);
    return rows;
  });

export const getContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("generated_content")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: uuid.optional(),
        project_id: uuid.nullable().optional(),
        content_type: z.string().max(30),
        platform: z.string().max(40).nullable().optional(),
        title: z.string().min(1).max(200),
        original_input: z.string().max(8000).optional(),
        optimized_prompt: z.string().max(8000).optional(),
        body: z.string().min(1).max(60000),
        metadata: z.record(z.any()).default({}),
        model: z.string().max(80).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const wordCount = data.body.trim().split(/\s+/).filter(Boolean).length;
    let version = 1;
    if (data.id) {
      const { data: existing } = await context.supabase
        .from("generated_content")
        .select("version")
        .eq("id", data.id)
        .maybeSingle();
      version = (existing?.version ?? 0) + 1;
    }
    const payload = {
      user_id: context.userId,
      project_id: data.project_id ?? null,
      content_type: data.content_type,
      platform: data.platform ?? null,
      title: data.title,
      original_input: data.original_input ?? null,
      optimized_prompt: data.optimized_prompt ?? null,
      body: data.body,
      metadata: data.metadata as never,
      model: data.model ?? null,
      word_count: wordCount,
      version,
      ...(data.id ? { id: data.id } : {}),
    };
    const { data: row, error } = await context.supabase
      .from("generated_content")
      .upsert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("generated_content").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- search ---------------------------------- */

export const globalSearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ q: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const term = `%${data.q}%`;
    const [projects, prompts, content] = await Promise.all([
      context.supabase.from("projects").select("id,name,status").ilike("name", term).limit(6),
      context.supabase.from("prompts").select("id,title,category").ilike("title", term).limit(6),
      context.supabase
        .from("generated_content")
        .select("id,title,content_type")
        .ilike("title", term)
        .limit(6),
    ]);
    return {
      projects: projects.data ?? [],
      prompts: prompts.data ?? [],
      content: content.data ?? [],
    };
  });

/* --------------------------------- analytics -------------------------------- */

export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ days: z.number().int().min(0).max(3650).default(0) }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    const since =
      data.days > 0 ? new Date(Date.now() - data.days * 86400000).toISOString() : "1970-01-01T00:00:00Z";

    let contentQuery = context.supabase
      .from("generated_content")
      .select("content_type,platform,word_count,created_at")
      .eq("user_id", context.userId)
      .gte("created_at", since);
    const { data: content, error } = await contentQuery;
    if (error) throw new Error(error.message);

    const { data: projects } = await context.supabase
      .from("projects")
      .select("id,created_at")
      .eq("user_id", context.userId)
      .gte("created_at", since);

    const { data: prompts } = await context.supabase
      .from("prompts")
      .select("use_count,created_at")
      .eq("user_id", context.userId)
      .gte("created_at", since);

    const rows = content ?? [];
    const byType: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    let words = 0;
    for (const r of rows) {
      byType[r.content_type] = (byType[r.content_type] ?? 0) + 1;
      if (r.platform) byPlatform[r.platform] = (byPlatform[r.platform] ?? 0) + 1;
      words += r.word_count ?? 0;
    }

    const daily: Record<string, number> = {};
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      daily[day] = (daily[day] ?? 0) + 1;
    }

    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topPlatform = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      totalContent: rows.length,
      words,
      projects: projects?.length ?? 0,
      prompts: prompts?.length ?? 0,
      promptUses: (prompts ?? []).reduce((sum, p) => sum + (p.use_count ?? 0), 0),
      byType,
      byPlatform,
      daily: Object.entries(daily)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count })),
      topType,
      topPlatform,
    };
  });
