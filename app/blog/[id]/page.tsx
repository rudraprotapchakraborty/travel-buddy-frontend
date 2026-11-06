import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { BLOG_POSTS, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(id);
  return post
    ? { title: `${post.title} | Travel Buddy`, description: post.excerpt }
    : { title: "Article not found | Travel Buddy" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-primary-400">
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>

      <div className={`mt-6 flex aspect-[21/9] w-full items-center justify-center rounded-3xl bg-gradient-to-br ${post.color} text-7xl`}>
        {post.image}
      </div>

      <header className="mt-8">
        <span className="rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-400">
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{post.date}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTime}</span>
        </div>
      </header>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-300">
        <p className="text-xl text-slate-200">{post.excerpt.replace(/\.\.\.$/, ".")}</p>
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-14 border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold text-white">Keep reading</h2>
        <ul className="mt-4 space-y-3">
          {related.map((p) => (
            <li key={p.id}>
              <Link href={`/blog/${p.id}`} className="text-slate-400 transition-colors hover:text-primary-400">
                {p.image} {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
