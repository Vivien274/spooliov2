const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const newPost = {
  title: "Fidgets à l'école : Comment les outils tactiles aident les enfants à se concentrer en classe",
  slug: "fidgets-a-lecole-comment-les-outils-tactiles-aident-les-enfants-a-se-concentrer-en-classe",
  excerpt: "Entre agitation, baisse d'attention et besoin de bouger les doigts en classe : découvrez comment les fidgets tactiles et silencieux aident les enfants (et notamment les élèves TDAH) à mieux se concentrer à l'école.",
  content: `
<p class="wp-block-paragraph">À chaque rentrée scolaire ou au fil de l'année, le même défi revient pour les enseignants et les parents : comment aider un enfant agité ou facilement distrait à rester concentré pendant les cours ? Faire tourner son crayon, cliquer en boucle sur son stylo, s'agiter sur sa chaise... Ce besoin de mouvement physique n'est pas de la mauvaise volonté : c'est un mécanisme naturel du cerveau pour réguler son attention.</p>

<h2 class="wp-block-heading">Pourquoi bouger les mains aide à mieux écouter ?</h2>
<p class="wp-block-paragraph">En neuroergonomie et en psychologie de l'enfant, on sait que le cerveau a besoin d'un niveau d'éveil moteur optimal pour soutenir une activité intellectuelle soutenue. Pour de nombreux élèves, en particulier ceux présentant un <strong>TDAH (Trouble du Déficit de l'Attention avec ou sans Hyperactivité)</strong> ou une hypersensibilité, la stimulation tactile fine — ce qu'on appelle le <em>fidgeting</em> — permet d'évacuer le surplus d'énergie motrice sans solliciter l'attention visuelle ou auditive nécessaire pour suivre la leçon.</p>

<h2 class="wp-block-heading">Jouet récréatif vs Outil de concentration : La règle d'or en classe</h2>
<p class="wp-block-paragraph">Tous les fidgets ne se valent pas à l'école. Un gadget trop coloré, bruyant ou lumineux devient rapidement une source de distraction pour l'élève et ses camarades. Pour être accepté et efficace en classe, un fidget doit respecter trois règles d'or :</p>
<ul class="wp-block-list">
  <li><strong>100% Silencieux (Niveau 1/3 Spoolio)</strong> : Aucun bruit de clic ou de frottement qui pourrait déranger l'enseignant ou les voisins de table.</li>
  <li><strong>Discret et ergonomique</strong> : Un objet petit, qui tient au creux de la main ou au bout des doigts (comme une bague rotative ou un rouleau tactile).</li>
  <li><strong>Utilisé sans regard direct</strong> : L'enfant doit pouvoir manipuler l'objet les yeux fixés sur le tableau ou l'enseignant.</li>
</ul>

<h2 class="wp-block-heading">Les bienfaits constatés par les parents et enseignants</h2>
<p class="wp-block-paragraph">Lorsqu'un outil sensoriel adapté est mis en place, les résultats sont rapidement visibles :</p>
<ul class="wp-block-list">
  <li><strong>Moins d'anxiété et de comportement d'évitement</strong> lors des évaluations ou des exercices longs.</li>
  <li><strong>Réduction des tics de stress</strong> (mordillage de crayons, rongement d'ongles, griffonneries frénétiques).</li>
  <li><strong>Meilleure rétention d'information</strong> pendant les explications orales.</li>
</ul>

<h2 class="wp-block-heading">Comment choisir le bon fidget pour son enfant ?</h2>
<p class="wp-block-paragraph">Chaque enfant a des préférences sensorielles uniques : certains recherchent un mouvement fluide et continu, tandis que d'autres ont besoin d'une texture imprimée 3D en relief. Chez Spoolio, nos créations sont conçues en France en PLA biosourcé à partir de matière végétale, sans aucun produit toxique.</p>

<p class="wp-block-paragraph">Pour trouver le compagnon de classe idéal et silencieux, découvrez notre outil interactif : <a href="/boussole-sensorielle">Essayez la Boussole Sensorielle Spoolio</a> 🎒✨</p>
`,
  featuredImageUrl: "/images/imported/Spoolio-pack-fidget-clicker-3d-17-scaled.webp",
  status: "publish",
  date: new Date(),
};

async function main() {
  console.log('Inserting blog post into Prisma...');
  const post = await prisma.blogPost.upsert({
    where: { slug: newPost.slug },
    update: {
      title: newPost.title,
      excerpt: newPost.excerpt,
      content: newPost.content,
      featuredImageUrl: newPost.featuredImageUrl,
      status: newPost.status,
    },
    create: {
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      content: newPost.content,
      featuredImageUrl: newPost.featuredImageUrl,
      status: newPost.status,
      date: newPost.date,
    },
  });

  console.log('Blog post inserted into database with ID:', post.id);

  // Update src/data/blog.json if present
  const jsonPath = path.join(__dirname, '../src/data/blog.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const exists = data.some((p) => p.slug === newPost.slug);
      if (!exists) {
        data.unshift({
          id: post.id,
          date: newPost.date.toISOString(),
          slug: newPost.slug,
          status: "publish",
          title: { rendered: newPost.title },
          excerpt: { rendered: `<p>${newPost.excerpt}</p>` },
          content: { rendered: newPost.content },
          featuredImageUrl: newPost.featuredImageUrl,
          metaTitle: newPost.title,
          metaDescription: newPost.excerpt,
        });
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log('Updated src/data/blog.json successfully!');
      }
    } catch (e) {
      console.warn('Warning updating blog.json:', e.message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
