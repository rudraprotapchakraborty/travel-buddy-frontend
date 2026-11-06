export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  color: string;
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "10 Essential Tips for First-Time Solo Travelers",
    excerpt:
      "Solo travel is one of the most rewarding experiences, but it can be daunting. Here's what you need to know before you go...",
    author: "Sarah Jenkins",
    date: "Dec 15, 2024",
    category: "Solo Travel",
    readTime: "5 min read",
    image: "🏔️",
    color: "from-blue-500/20 to-cyan-500/20",
    body: [
      "Travelling alone is less about being by yourself and more about travelling at your own pace. Start with a destination that is easy to move around in, with reliable public transport and plenty of other travellers, so your first trip builds confidence instead of stress.",
      "Share your itinerary with someone at home and check in regularly. Keep digital and paper copies of your passport and bookings, and carry a small amount of emergency cash separate from your main wallet. Book your first night in advance so you never arrive somewhere unfamiliar with nowhere to sleep.",
      "Stay open to company. Hostels, walking tours and meetups are the easiest ways to meet people, and on Travel Buddy you can post your plan and find someone heading the same way for part of the journey. Trust your instincts: if a situation feels wrong, leave.",
    ],
  },
  {
    id: 2,
    title: "How to Find the Perfect Travel Buddy Online",
    excerpt:
      "Safety, interests, and budget—finding a compatible companion is an art. Our guide helps you navigate the process...",
    author: "Arif Rahman",
    date: "Dec 12, 2024",
    category: "Community",
    readTime: "7 min read",
    image: "🤝",
    color: "from-purple-500/20 to-pink-500/20",
    body: [
      "A good travel companion matches you on three things: pace, budget and expectations. Before you commit, talk about whether you like early starts or slow mornings, how much you plan to spend each day and how much time you want to spend together versus apart.",
      "Read profiles and reviews carefully. Look for travellers with completed trips and honest feedback from previous companions. Start with a short trip or a few shared days before agreeing to a long journey together.",
      "Meet in a public place first, keep your own bookings and never send money to someone you have not met. Agree early on how you will split costs, and decide in advance how you will handle disagreements on the road.",
    ],
  },
  {
    id: 3,
    title: "Hidden Gems: Budget-Friendly Destinations in 2025",
    excerpt:
      "Explore stunning locations that won't break the bank. From Southeast Asia to Eastern Europe, discover where to go next...",
    author: "Elena Rossi",
    date: "Dec 10, 2024",
    category: "Budget",
    readTime: "6 min read",
    image: "🏝️",
    color: "from-emerald-500/20 to-teal-500/20",
    body: [
      "Great trips do not need big budgets. Parts of Southeast Asia, the Balkans and the Caucasus offer excellent food, scenery and culture at a fraction of the cost of the usual hotspots, especially outside peak season.",
      "Your biggest savings come from timing and company. Travel in shoulder season, book transport early, eat where locals eat and share rooms and taxis with a travel buddy to cut the daily cost of a trip by a third or more.",
      "Set a daily budget before you go and track it. A small cushion for surprises matters more than finding the cheapest bed, and travel insurance is worth the cost wherever you end up.",
    ],
  },
  {
    id: 4,
    title: "The Ultimate Packing List for Adventure Seekers",
    excerpt:
      "Don't forget the essentials. We've compiled a list of everything from gear to medical kits for your next mountain trek...",
    author: "David Chen",
    date: "Dec 08, 2024",
    category: "Adventure",
    readTime: "8 min read",
    image: "🎒",
    color: "from-orange-500/20 to-red-500/20",
    body: [
      "Pack for the conditions, not the worst case. Layers beat bulk: a base layer, an insulating mid layer and a waterproof shell cover most weather. Choose broken-in footwear and bring spare socks, because blisters end more trips than bad weather.",
      "Carry a compact first aid kit with plasters, blister care, pain relief, any personal medication and electrolyte tablets. Add a headlamp, a power bank, a water filter or purification tablets and a printed map for areas without signal.",
      "Weigh your bag before you leave and remove anything you did not use on your last trip. Tell someone your route and expected return time, and agree on what they should do if they do not hear from you.",
    ],
  },
  {
    id: 5,
    title: "Staying Safe: Identity Verification in Travel Apps",
    excerpt:
      "Learn how we use advanced security protocols to ensure every traveler you meet is verified and trustworthy...",
    author: "Admin Team",
    date: "Dec 05, 2024",
    category: "Safety",
    readTime: "4 min read",
    image: "🛡️",
    color: "from-indigo-500/20 to-blue-500/20",
    body: [
      "Every Travel Buddy account must confirm its email address with a one-time code before it can be used, and members can add a paid plan that shows a verified badge. These steps reduce fake accounts, but a badge is not a background check, so use your own judgement.",
      "Check a profile's history, ratings and reviews before agreeing to travel. Be cautious of anyone who rushes you, asks for money or pushes to move the conversation to another app straight away.",
      "Meet in public places, share your plans with someone you trust and report anything suspicious through the Contact page. We review reports and can suspend accounts that break the rules.",
    ],
  },
  {
    id: 6,
    title: "Sustainable Travel: Leaving Only Footprints",
    excerpt:
      "How to be a responsible traveler. Discover eco-friendly stays and ways to support local communities on your journey...",
    author: "Sarah Jenkins",
    date: "Dec 01, 2024",
    category: "Eco-Travel",
    readTime: "10 min read",
    image: "🌿",
    color: "from-green-500/20 to-emerald-500/20",
    body: [
      "Sustainable travel starts with small choices that add up: take trains over short flights, carry a refillable bottle, say no to single-use plastics and stay longer in fewer places instead of rushing through many.",
      "Spend where it helps. Choose locally owned guesthouses, eat at family restaurants and book guides from the community. Ask before photographing people and learn a few words of the local language.",
      "Respect the places you visit. Stay on marked trails, do not remove plants, shells or artefacts, and take your rubbish with you. Travelling with a buddy makes it easier to share rides and cut your footprint further.",
    ],
  },
];

export const getPost = (id: string) => BLOG_POSTS.find((p) => String(p.id) === id);
