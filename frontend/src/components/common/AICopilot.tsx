import { useState } from 'react';
import { Product } from '@/types/product.types';
import {
    X,
    Send,
    Bot,
    TrendingUp,
    AlertTriangle,
    WandSparkles,
    Sparkles,
    Copy,
    ShieldCheck,
    Heart,
    Lightbulb,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AICopilotProps {
    qualityScore?: number;
    totalProducts?: number;
    enrichmentRate?: number;
    duplicateClusters?: number;
    missingAttributes?: number;
    products?: Product[];
}

export function AICopilot({
    qualityScore = 88.4,
    totalProducts = 1420,
    enrichmentRate = 90.7,
    duplicateClusters = 6,
    missingAttributes = 5,
    products = [],
}: AICopilotProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState<
        { role: 'user' | 'ai'; text: string }[]
    >([]);

    const generateResponse = (question: string) => {
        const q = question.toLowerCase();

        /* ---------------- GREETINGS ---------------- */

        if (
            q.includes('hello') ||
            q.includes('hi') ||
            q.includes('hey') ||
            q.includes('good morning') ||
            q.includes('good evening')
        ) {
            return `Hey! 👋 It's good to have you here.

I'm ANVAYA Copilot, and I'm here to make your catalog work a little easier. I can help you understand what's happening, spot things worth fixing, and decide what to focus on next.

You don't have to phrase things perfectly — just ask me naturally. 🤍`;
        }
        /* ---------------- PRODUCT RECOMMENDATIONS ---------------- */

        const isRecommendationQuestion =
            q.includes('best') ||
            q.includes('top') ||
            q.includes('recommend') ||
            q.includes('which product') ||
            q.includes('which one') ||
            q.includes('suggest a product');

        const isAudioQuestion =
            q.includes('airdopes') ||
            q.includes('airpods') ||
            q.includes('earbuds') ||
            q.includes('earphone') ||
            q.includes('headphone') ||
            q.includes('headphones') ||
            q.includes('wireless earbuds');

        if (isRecommendationQuestion && isAudioQuestion) {
            const matchingProducts = products.filter((product) => {
                const text = `${product.title} ${product.sku} ${(product as any).category || ''
                    }`.toLowerCase();

                return (
                    text.includes('airdopes') ||
                    text.includes('airpods') ||
                    text.includes('earbuds') ||
                    text.includes('earphone') ||
                    text.includes('headphone')
                );
            });

            if (matchingProducts.length > 0) {
                const rankedProducts = [...matchingProducts].sort(
                    (a, b) =>
                        (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
                );

                const best = rankedProducts[0];

                return `Of course 🤍 I checked your current catalog.

🎧 **My top pick is ${best.title}.**

• **Quality:** ${best.qualityScore ?? 'N/A'}/100
• **Price:** ₹${best.price?.toLocaleString() ?? 'N/A'}
• **SKU:** ${best.sku}

I'm recommending this one because it currently has the strongest quality score among the audio products I can see.

If you want, I can also compare the **top 3 by quality, price, and completeness** and help you choose. ✨`;
            }

            return `I'd love to help you choose one. 🤍

I checked the catalog data currently available to me, but I couldn't find an Airdopes or other audio product to compare.

If you add the relevant catalog data, I'll be happy to compare them for you. 🌱`;
        }
        /* ---------------- QUALITY ---------------- */

        if (
            q.includes('quality') ||
            q.includes('score') ||

            q.includes('health')
        ) {
            if (qualityScore >= 90) {
                return `You're doing really well. ✨

Your current catalog quality score is ${qualityScore}/100, which is a strong position to be in.

There may still be smaller inconsistencies worth cleaning up, but I wouldn't recommend changing everything at once.

I'd focus on maintaining this quality while improving the remaining gaps.

And honestly, nice work getting the catalog this far. 🤍`;
            }

            if (qualityScore >= 80) {
                return `Your catalog is in a pretty healthy place. 🌱

You're currently at ${qualityScore}/100.

That's a solid foundation, but I can see a few opportunities to push that score higher. The biggest gains are likely to come from improving missing attributes, reviewing duplicate products, and strengthening lower-confidence enrichment results.

You don't need to fix everything at once.

If you want my recommendation, I'd start with the areas affecting the most products. I'll help you work through them. 🤍`;
            }

            return `I noticed your quality score is ${qualityScore}/100.

Don't worry — this is exactly the kind of situation ANVAYA is designed to help with. 🌱

I'd start by identifying the attributes and products contributing most to the score, then work through those before making broader changes.

Small, focused improvements can make a big difference.

If you'd like, I can help you decide what to tackle first.`;
        }

        /* ---------------- BIGGEST ISSUES ---------------- */

        if (
            q.includes('biggest issue') ||
            q.includes('biggest problem') ||
            q.includes('problems') ||
            q.includes('issues') ||
            q.includes('wrong')
        ) {
            return `I've got you. Here's what I'd pay attention to right now. 👀

**1. Missing attributes**
You currently have ${missingAttributes} major attribute areas being monitored. These can directly affect product discovery and completeness.

**2. Duplicate products**
There are ${duplicateClusters} semantic duplicate clusters. Cleaning these up can make your catalog easier to manage and may reduce unnecessary duplication.

**3. Enrichment quality**
Your AI enrichment rate is ${enrichmentRate}%. That's encouraging, but I'd still review lower-confidence recoveries before treating everything as final.

If I were working on this catalog with you, I'd start with the missing attributes first. That's likely to give you the clearest improvement.

One step at a time. 🌱`;
        }

        /* ---------------- PRODUCTS ---------------- */

        if (
            q.includes('product') ||
            q.includes('sku') ||
            q.includes('catalog size') ||
            q.includes('how many') ||
            q.includes('catalog')
        ) {
            return `Right now, ANVAYA is working with **${totalProducts.toLocaleString()} products** in your catalog. 📦

That's a good amount of data to manage manually, which is exactly where automation starts becoming valuable.

Instead of checking every product one by one, ANVAYA can help you focus on the products that actually need attention.

If you'd like, I can help you understand where the biggest opportunities are.`;
        }

        /* ---------------- ENRICHMENT ---------------- */

        if (
            q.includes('enrichment') ||
            q.includes('recovered') ||
            q.includes('attribute recovery') ||
            q.includes('ai recovery')
        ) {
            return `Your current AI enrichment rate is **${enrichmentRate}%**. ✨

That's a strong sign that ANVAYA is recovering a large portion of the missing product information.

But there's an important distinction: enrichment isn't just about filling fields. We also want those recovered values to be reliable.

My recommendation would be to pay extra attention to lower-confidence recoveries and verify the important attributes before they become part of your final catalog.

Good progress so far. 🤍`;
        }

        /* ---------------- DUPLICATES ---------------- */

        if (
            q.includes('duplicate') ||
            q.includes('duplicates') ||
            q.includes('cluster')
        ) {
            return `I found **${duplicateClusters} semantic duplicate clusters** worth looking at. 🔍

These are products that appear similar enough across different vendor feeds that they may represent the same underlying product.

The goal isn't simply to merge everything that looks similar.

I'd recommend checking:
• Product identity
• Key specifications
• Vendor/source
• Price differences
• Attribute completeness

Once we're confident they're truly the same product, consolidation can make your catalog cleaner and easier to maintain.

If you'd like, we can go through the duplicate clusters together.`;
        }

        /* ---------------- MISSING ATTRIBUTES ---------------- */

        if (
            q.includes('missing') ||
            q.includes('attribute gap') ||
            q.includes('gaps') ||
            q.includes('incomplete')
        ) {
            return `I noticed **${missingAttributes} major missing-attribute areas** being monitored right now. ⚠️

These gaps matter because incomplete product information can make products harder to discover, compare, and understand.

The good news is that you don't necessarily have to collect everything manually.

ANVAYA can recover useful attributes from unstructured descriptions and specifications, while keeping confidence information available for review.

I'd start with the attributes affecting the largest number of products. That's usually where you'll get the best return for your effort. 🌱`;
        }

        /* ---------------- IMPROVEMENT ---------------- */

        if (
            q.includes('improve') ||
            q.includes('recommend') ||
            q.includes('recommendation') ||
            q.includes('what should i do') ||
            q.includes('where should i start') ||
            q.includes('next')
        ) {
            return `Absolutely — let me make this simple. 🤍

If I were helping you work through the catalog right now, I'd prioritize things like this:

**1. Recover missing attributes** ✨
Start with the gaps affecting the most products.

**2. Review AI confidence** 🧠
Pay special attention to lower-confidence recovered values.

**3. Clean duplicate clusters** 🔍
Consolidate products only after their identity and important specifications are confirmed.

**4. Re-check quality** 📊
Once those improvements are made, run another quality review and see how much the catalog has moved.

You don't need to solve everything today.

Let's make one meaningful improvement at a time. 🌱`;
        }

        /* ---------------- THANK YOU ---------------- */

        if (
            q.includes('thank') ||
            q.includes('thanks') ||
            q.includes('appreciate')
        ) {
            return `You're very welcome. 🤍

And thank you for trusting me with your catalog.

I'll keep things simple, honest, and useful — and whenever there's something worth paying attention to, I'll tell you.

We've got this. 🌱`;
        }

        /* ---------------- HELP ---------------- */

        if (
            q.includes('help') ||
            q.includes('what can you do') ||
            q.includes('what do you do')
        ) {
            return `Of course. I'm here to help you with the catalog. 🤍

You can ask me things like:

• "How healthy is my catalog?"
• "What are my biggest issues?"
• "What should I improve first?"
• "Why is my quality score like this?"
• "How is AI enrichment performing?"
• "What should I do about duplicates?"
• "Where are my missing attributes?"

You don't need to use technical language.

Just tell me what you're trying to understand, and I'll take it from there. ✨`;
        }

        /* ---------------- POSITIVE / CASUAL ---------------- */

        if (
            q.includes('good job') ||
            q.includes('great') ||
            q.includes('awesome') ||
            q.includes('nice')
        ) {
            return `Thank you. 🤍

I'm glad I can be useful.

And honestly, the catalog is already showing some good progress — ${qualityScore}/100 quality with ${enrichmentRate}% enrichment is a solid foundation.

Let's keep improving it without making things unnecessarily complicated. 🌱`;
        }

        /* ---------------- DEFAULT ---------------- */

        return `I'm listening. 🤍

I can help you understand your catalog's quality, enrichment, missing attributes, duplicate products, and what I'd recommend doing next.

You can ask me in your own words — even if you're not sure what to ask.

For example:

**"What should I worry about right now?"**

or

**"Is my catalog actually doing well?"**

I'll help you make sense of it. ✨`;
    };

    const handleSend = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        const response = generateResponse(trimmedMessage);

        setConversation((previous) => [
            ...previous,
            { role: 'user', text: trimmedMessage },
            { role: 'ai', text: response },
        ]);

        setMessage('');
    };

    const askSuggestion = (question: string) => {
        setMessage(question);
    };

    const suggestions = [
        {
            icon: Lightbulb,
            text: 'What should I focus on first?',
        },
        {
            icon: TrendingUp,
            text: 'How healthy is my catalog?',
        },
        {
            icon: AlertTriangle,
            text: 'What are my biggest issues?',
        },
        {
            icon: WandSparkles,
            text: 'How can AI improve my catalog?',
        },
        {
            icon: Copy,
            text: 'What should I do about duplicates?',
        },
    ];

    return (
        <>
            {/* Floating Copilot Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-card/95 px-4 py-3 text-sm font-semibold text-foreground shadow-xl shadow-primary/10 backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:shadow-primary/20"
                >
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                        <Sparkles className="h-4 w-4 text-primary" />

                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-card" />
                    </span>

                    <span>Talk to ANVAYA</span>
                </button>
            )}

            {/* Copilot Window */}
            {open && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[590px] w-[400px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    {/* Header */}
                    <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                                    <WandSparkles className="h-5 w-5 text-primary" />

                                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">
                                            ANVAYA
                                        </span>

                                        <span className="text-[10px] font-medium text-muted-foreground">
                                            Personal Copilot
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground">
                                        Here to help you make sense of your catalog
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {conversation.length === 0 ? (
                            <>
                                {/* Personal Welcome */}
                                <div className="flex gap-2.5">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>

                                    <div className="max-w-[88%] rounded-xl rounded-tl-sm border border-border/50 bg-secondary/40 p-3">
                                        <p className="text-xs leading-relaxed text-foreground">
                                            Hey! 👋 I'm your ANVAYA Copilot.
                                        </p>

                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            I'm glad you're here. I've been keeping an eye on your
                                            catalog, and I'm ready to help you understand what's
                                            happening, spot what needs attention, and figure out
                                            what to do next.
                                        </p>

                                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                                            You don't need to know the technical stuff — just ask
                                            me naturally. 🤍
                                        </p>
                                    </div>
                                </div>

                                {/* Gratitude / encouragement */}
                                <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 p-2.5">
                                    <Heart className="h-3.5 w-3.5 flex-shrink-0 text-primary" />

                                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                                        Thanks for trusting ANVAYA with your catalog. We'll
                                        improve it one meaningful step at a time. 🌱
                                    </p>
                                </div>

                                {/* Live Context */}
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />

                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                            Your Catalog Right Now
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[9px] text-muted-foreground">
                                                Quality
                                            </p>

                                            <p className="text-xs font-bold">
                                                {qualityScore}/100
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] text-muted-foreground">
                                                Products
                                            </p>

                                            <p className="text-xs font-bold">
                                                {totalProducts.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] text-muted-foreground">
                                                Enrichment
                                            </p>

                                            <p className="text-xs font-bold">
                                                {enrichmentRate}%
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] text-muted-foreground">
                                                Duplicate Clusters
                                            </p>

                                            <p className="text-xs font-bold">
                                                {duplicateClusters}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Start wherever you like
                                    </p>

                                    {suggestions.map((suggestion) => {
                                        const Icon = suggestion.icon;

                                        return (
                                            <button
                                                key={suggestion.text}
                                                onClick={() => askSuggestion(suggestion.text)}
                                                className="group flex w-full items-center gap-2.5 rounded-lg border border-border/50 bg-secondary/20 p-2.5 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                                            >
                                                <Icon className="h-3.5 w-3.5 text-primary" />

                                                <span className="flex-1 text-[11px] text-muted-foreground group-hover:text-foreground">
                                                    {suggestion.text}
                                                </span>

                                                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            conversation.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-2.5 ${item.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                        }`}
                                >
                                    {item.role === 'ai' && (
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[84%] whitespace-pre-line rounded-xl p-3 text-xs leading-relaxed ${item.role === 'user'
                                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                                            : 'rounded-tl-sm border border-border/50 bg-secondary/40 text-foreground'
                                            }`}
                                    >
                                        {item.text}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-border/60 bg-secondary/10 p-3">
                        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 p-1.5">
                            <input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSend();
                                    }
                                }}
                                placeholder="Tell me what's on your mind..."
                                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
                            />

                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={!message.trim()}
                                className="h-8 w-8 rounded-lg"
                            >
                                <Send className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <p className="mt-2 text-center text-[9px] text-muted-foreground">
                            Your catalog context stays at the center of every answer 🤍
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
