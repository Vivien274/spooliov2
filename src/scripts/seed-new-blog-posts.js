const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const newPosts = [
  {
    id: 13001,
    date: "2026-07-28T10:00:00",
    date_gmt: "2026-07-28T09:00:00",
    slug: "pourquoi-le-fidget-est-devenu-laccessoire-indispensable-au-bureau",
    status: "publish",
    title: {
      rendered: "Pourquoi le Fidget est devenu le nouvel accessoire indispensable au bureau (et en réunion)"
    },
    excerpt: {
      rendered: "<p>Longues réunions Zoom, appels sans fin ou besoin de canaliser son énergie au bureau : découvrez comment les fidgets tactiles et silencieux améliorent la concentration au travail.</p>"
    },
    content: {
      rendered: `
<p class="wp-block-paragraph">On a tous déjà vécu ce moment en réunion ou devant un document complexe : faire tourner machinalement son stylo entre ses doigts, cliquer en boucle sur son stylo à bille (au grand dam de son voisin de bureau), ou gribouiller nerveusement sur un bloc-notes. Ce besoin de bouger les doigts n'est pas un signe d'inattention — c'est exactement l'inverse.</p>

<h2 class="wp-block-heading">Le besoin de stimulation motrice fine au travail</h2>
<p class="wp-block-paragraph">En neuroergonomie, on sait que le cerveau humain a besoin d'un niveau d'éveil moteur optimal pour maintenir son attention sur une tâche intellectuelle prolongée. Lorsque nous restons immobiles trop longtemps devant un écran, une partie de notre cerveau cherche de la stimulation. Offrir à ses mains une micro-activité tactile répétitive (ce qu'on appelle le <em>fidgeting</em>) permet de libérer ce surplus d'énergie motrice sans solliciter la mémoire visuelle ou auditive.</p>

<h2 class="wp-block-heading">Réduire le stress et les tensions invisibles</h2>
<p class="wp-block-paragraph">Au-delà de la concentration, avoir un objet sensoriel à portée de main durant sa journée de travail agit comme une soupape de décompression. Manipuler une texture imprimée en 3D ou faire glisser un roulement fluide aide à réduire le niveau de cortisol (l'hormone du stress) et apporte un point d'ancrage tactile apaisant.</p>

<h2 class="wp-block-heading">Fidget Discret vs Bruit Gênant : La règle d'or en bureau partagé</h2>
<p class="wp-block-paragraph">En open-space ou lors d'une visioconférence, la discrétion est primordiale. Il est hors de question d'agacer ses collègues avec des bruits répétés ! C'est pourquoi chez Spoolio, nous évaluons chaque création sur notre <strong>Niveau Sonore</strong> (de 1/3 Silencieux à 3/3 Clic ASMR). Pour le bureau, nous recommandons les modèles notés <strong>1/3 Discret / Silencieux</strong> — comme nos bagues rotatives ou nos spinners à frottement ultra-doux.</p>

<h2 class="wp-block-heading">En résumé : Adoptez l'ergonomie sensorielle</h2>
<p class="wp-block-paragraph">Le fidget professionnel n'est pas un jouet, mais un véritable outil de confort de travail. Pensé, conçu et fabriqué dans notre atelier en France en PLA végétal, il s'intègre naturellement sur votre bureau.</p>

<p class="wp-block-paragraph">Envie d'essayer ? <a href="/boussole-sensorielle">Utilisez notre Boussole Sensorielle</a> pour trouver le fidget silencieux parfait pour votre journée de travail ! 💼</p>
`
    },
    jetpack_featured_media_url: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    featured_image_src: {
      full: ["/images/imported/Spoolio_Kit-Festival-16-scaled.webp", 1200, 800, false]
    }
  },
  {
    id: 13002,
    date: "2026-07-28T10:30:00",
    date_gmt: "2026-07-28T09:30:00",
    slug: "tdah-anxiete-comment-la-stimulation-tactile-aide-a-canaliser-lattention",
    status: "publish",
    title: {
      rendered: "TDAH & Anxiété : Comment la stimulation tactile (Fidgets 3D) aide à canaliser l'attention"
    },
    excerpt: {
      rendered: "<p>Le stimming tactile est un levier puissant pour les personnes atteintes de TDAH ou sujettes à l'anxiété. Explications simples et conseils d'utilisation au quotidien.</p>"
    },
    content: {
      rendered: `
<p class="wp-block-paragraph">Pour les personnes présentant un Trouble du Déficit de l'Attention avec ou sans Hyperactivité (TDAH) ou une sensibilité élevée à l'anxiété, rester concentré sur une tâche linéaire peut relever du défi quotidien. Heureusement, des outils simples basés sur la stimulation sensorielle offrent un soutien précieux au quotidien.</p>

<h2 class="wp-block-heading">Qu'est-ce que le "Stimming" et pourquoi est-il bénéfique ?</h2>
<p class="wp-block-paragraph">Le terme <em>stimming</em> désigne les comportements d'auto-stimulation sensorielle ou motrice. Pour un cerveau TDAH, la recherche de stimulation sensorielle (tactile, auditive, proprioceptive) n'est pas un caprice : c'est un mécanisme naturel de régulation dopaminergique. En occupant une fraction de la motricité fine avec un objet 3D satisfaisant, le cerveau parvient mieux à filtrer les distractions environnantes.</p>

<h2 class="wp-block-heading">Le rôle du retour haptique (clic et texture 3D)</h2>
<p class="wp-block-paragraph">L'un des grands atouts des fidgets fabriqués en impression 3D réside dans leur variété de textures et de retours haptiques. Qu'il s'agisse du clic net d'un switch mécanique de clavier ou du balancier régulier d'un engrenage planétaire, la précision du retour tactile envoie un signal clair au système nerveux central, procurant un apaisement quasi immédiat.</p>

<h2 class="wp-block-heading">Comment intégrer les fidgets dans sa routine quotidienne ?</h2>
<ul class="wp-block-list">
  <li><strong>Pendant la lecture ou l'apprentissage</strong> : garder un fidget silencieux en main pour canaliser l'agitation physique.</li>
  <li><strong>Pendant les moments de pic d'anxiété</strong> : utiliser un clicker à retour fort (ASMR) pour ancrer son attention sur la sensation physique.</li>
  <li><strong>Au moment d'aller se coucher</strong> : privilégier les mouvements lents et fluides pour favoriser l'apaisement du système nerveux.</li>
</ul>

<h2 class="wp-block-heading">Des créations pensées pour votre bien-être</h2>
<p class="wp-block-paragraph">Chez Spoolio, chaque modèle est conçu pour offrir une expérience tactile unique, imprimé en PLA biosourcé respectueux de l'environnement et de votre santé.</p>

<p class="wp-block-paragraph">Découvrez notre gamme complète et créez votre objet sur-mesure sur notre <a href="/createur-cliqueur">Créateur de Clicker 3D</a> ! 🧠✨</p>
`
    },
    jetpack_featured_media_url: "/images/imported/Spoolio-pack-fidget-clicker-3d-17-scaled.webp",
    featured_image_src: {
      full: ["/images/imported/Spoolio-pack-fidget-clicker-3d-17-scaled.webp", 1200, 800, false]
    }
  }
];

async function main() {
  console.log("Adding new blog posts to blog.json & Prisma...");
  
  // 1. Update src/data/blog.json
  const blogJsonPath = path.join(__dirname, '../data/blog.json');
  let currentBlogJson = [];
  if (fs.existsSync(blogJsonPath)) {
    try {
      currentBlogJson = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
    } catch (e) {
      currentBlogJson = [];
    }
  }

  // Filter out existing ones with same slug
  const updatedBlogJson = [
    ...newPosts,
    ...currentBlogJson.filter(p => !newPosts.some(np => np.slug === p.slug))
  ];

  fs.writeFileSync(blogJsonPath, JSON.stringify(updatedBlogJson, null, 2), 'utf8');
  console.log("Successfully updated src/data/blog.json!");

  // 2. Upsert into Prisma DB
  for (const item of newPosts) {
    try {
      const titleText = item.title.rendered;
      const contentHtml = item.content.rendered;
      const excerptHtml = item.excerpt.rendered;
      const imageSrc = item.jetpack_featured_media_url;

      await prisma.blogPost.upsert({
        where: { slug: item.slug },
        update: {
          title: titleText,
          content: contentHtml,
          excerpt: excerptHtml,
          featuredImageUrl: imageSrc,
          status: "publish",
          date: new Date(item.date),
        },
        create: {
          slug: item.slug,
          title: titleText,
          content: contentHtml,
          excerpt: excerptHtml,
          featuredImageUrl: imageSrc,
          status: "publish",
          date: new Date(item.date),
        },
      });
      console.log(`Prisma BlogPost upserted: ${item.slug}`);
    } catch (err) {
      console.error(`Error upserting ${item.slug} into Prisma:`, err.message);
    }
  }

  await prisma.$disconnect();
}

main();
