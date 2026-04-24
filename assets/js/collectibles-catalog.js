(() => {
  const collectiblesCatalogGroups = [
    {
      id: "figuras-vitrine",
      eyebrow: "Figuras",
      title: "Action Figures e Pecas de Vitrine",
      description:
        "Selecao para quem quer presenca visual forte, personagens iconicos e pecas que sustentam o clima do setup.",
      products: [
        { tag: "Action Figure", title: "John Wick", image: "gk01.jpg", url: "https://amzn.to/4tx6yry" },
        { tag: "Action Figure", title: "Thanos", image: "gk02.jpg", url: "https://amzn.to/48Sd6bP" },
        { tag: "Estatua", title: "Joel - The Last of Us Part II", image: "gk03.jpg", url: "https://amzn.to/4e6PyU5" },
        { tag: "Action Figure", title: "Shao Kahn - Mortal Kombat", image: "gk04.jpg", url: "https://amzn.to/42pMhbg" },
        { tag: "Action Figure", title: "Reptile - Mortal Kombat", image: "gk05.jpg", url: "https://amzn.to/4u0VqCX" },
        { tag: "Action Figure", title: "Raiden - Mortal Kombat", image: "gk06.jpg", url: "https://amzn.to/4w3olZ8" },
        { tag: "Action Figure", title: "Chun-Li - Street Fighter", image: "gk07.jpg", url: "https://amzn.to/4sWMT2V" },
        { tag: "Action Figure", title: "Ken Masters - Street Fighter", image: "gk08.jpg", url: "https://amzn.to/48P94ku" },
        { tag: "Action Figure", title: "Obi-Wan Kenobi", image: "gk11.jpg", url: "https://amzn.to/4mMHhHl" },
        { tag: "Mini Figure", title: "Goku Classico", image: "gk12.jpg", url: "https://amzn.to/4vOadCO" },
        { tag: "Pack Colecionavel", title: "Joel e Ellie - The Last of Us", image: "gk13.jpg", url: "https://amzn.to/4epkS0H" },
        { tag: "Action Figure", title: "Seiya de Pegaso", image: "gk14.jpg", url: "https://amzn.to/3OVatiK" },
        { tag: "Estatua Premium", title: "Goku Genki Dama", image: "gk15.jpg", url: "https://amzn.to/4u3sLND" },
        { tag: "Action Figure", title: "Jin Sakai - Ghost of Tsushima", image: "gk16.jpg", url: "https://amzn.to/3OBmuKa" },
        { tag: "Miniaturas", title: "Naruto Classico - Pack", image: "gk17.jpg", url: "https://amzn.to/4vOI5Q2" },
        { tag: "Action Figure", title: "The Mandalorian com Grogu", image: "gk19.jpg", url: "https://amzn.to/41NEqEp" },
      ],
    },
    {
      id: "funko-plush",
      eyebrow: "Funko & Plush",
      title: "Funko Pop, Pelucias e Achados de Personagem",
      description:
        "Pecas leves para presente, colecao rapida e composicao de estante com nostalgia, humor e cultura pop reconhecivel.",
      products: [
        { tag: "Pelucia", title: "Grogu", image: "gk09.jpg", url: "https://amzn.to/4sQjdVe" },
        { tag: "Luminaria 3D", title: "Darth Vader", image: "gk10.jpg", url: "https://amzn.to/41NRlpQ" },
        { tag: "Fandom Box", title: "Ratinho - Castelo Ra-Tim-Bum", image: "gk20.jpg", url: "https://amzn.to/4tGhDGA" },
        { tag: "Funko Pop", title: "Ayrton Senna #11", image: "gk23.jpg", url: "https://amzn.to/4mKvVmW" },
        { tag: "Funko Pop", title: "Ayrton Senna Lotus #10", image: "gk24.jpg", url: "https://amzn.to/4ubjAuS" },
        { tag: "Funko Pop", title: "The Mandalorian with Grogu", image: "gk25.jpg", url: "https://amzn.to/42v9NUg" },
        { tag: "Funko Pop", title: "Harry Potter com Hedwig", image: "gk26.jpg", url: "https://amzn.to/48Pevjo" },
        { tag: "Funko Pop", title: "Michael Jordan - Chicago Bulls", image: "gk27.jpg", url: "https://amzn.to/4d2Nlbf" },
        { tag: "Funko Pop", title: "Severus Snape", image: "gk28.jpg", url: "https://amzn.to/490d81h" },
        { tag: "Funko Pop", title: "Rumi - KPop Demon Hunters", image: "gk29.jpg", url: "https://amzn.to/4txcVes" },
        { tag: "Funko Pop", title: "Friendly Neighborhood Spider-Man", image: "gk30.jpg", url: "https://amzn.to/4cw4Gcs" },
        { tag: "Pelucia", title: "Mickey Mouse", image: "gk31.jpg", url: "https://amzn.to/3OGqPvq" },
      ],
    },
    {
      id: "lego-builders",
      eyebrow: "LEGO",
      title: "LEGO, Construcao e Sets de Display",
      description:
        "Montagens para quem curte exibir o processo criativo na mesa, no escritorio ou em uma vitrine geek mais arquitetada.",
      products: [
        { tag: "LEGO Sonic", title: "Speedster do Sonic", image: "gk32.jpg", url: "https://amzn.to/3OpJTy9" },
        { tag: "LEGO FIFA", title: "Trofeu Oficial da Copa do Mundo", image: "gk33.jpg", url: "https://amzn.to/4w3uLrc" },
        { tag: "LEGO Marvel", title: "Spider-Man vs Sandman e Venom", image: "gk34.jpg", url: "https://amzn.to/4d0iufs" },
        { tag: "LEGO Icons", title: "McLaren MP4/4 do Ayrton Senna", image: "gk35.jpg", url: "https://amzn.to/4mPNcva" },
        { tag: "LEGO Technic", title: "Moto Amarela", image: "gk36.jpg", url: "https://amzn.to/4u4H6th" },
        { tag: "LEGO Marvel", title: "Spider-Man vs Ghost Rider", image: "gk37.jpg", url: "https://amzn.to/4tBxZR8" },
        { tag: "LEGO Creator", title: "Onibus Espacial 3 em 1", image: "gk38.jpg", url: "https://amzn.to/4cvOnwp" },
      ],
    },
    {
      id: "decor-lifestyle",
      eyebrow: "Decor & Lifestyle",
      title: "Decoracao Geek, Utilidades e Presente Criativo",
      description:
        "Objetos de uso diario, humor visual e detalhes de ambiente para deixar o universo geek presente mesmo fora da prateleira.",
      products: [
        { tag: "Camiseta Geek", title: "God of War - Omega", image: "gk18.jpg", url: "https://amzn.to/4e1KAbh" },
        { tag: "Decoracao Geek", title: "Alienigena Verde", image: "gk21.jpg", url: "https://amzn.to/4cEOB2T" },
        { tag: "Miniatura Die-Cast", title: "Fusca Herbie 53", image: "gk22.jpg", url: "https://amzn.to/4mKvVmW" },
        { tag: "Cinema Geek", title: "Balde de Pipoca Zumbi", image: "gk39.jpg", url: "https://amzn.to/3QrGX4E" },
        { tag: "Porta-copos", title: "Super-Herois Marvel", image: "gk40.jpg", url: "https://amzn.to/41RXoty" },
        { tag: "Porta-copos", title: "Disquetes Retro", image: "gk41.jpg", url: "https://amzn.to/4cNYLhP" },
        { tag: "Porta-chaves", title: "Placa CHAVE5", image: "gk42.jpg", url: "https://amzn.to/3QppZ72" },
        { tag: "Porta-copos", title: "Senhor dos Aneis", image: "gk43.jpg", url: "https://amzn.to/4cNZ1gN" },
        { tag: "Porta-chaves", title: "Alohomora", image: "gk44.jpg", url: "https://amzn.to/4ttpsPP" },
        { tag: "Caneca Geek", title: "Python", image: "gk45.jpg", url: "https://amzn.to/3OGsXDq" },
        { tag: "Caneca Geek", title: "Estou Offline", image: "gk46.jpg", url: "https://amzn.to/4tr9Dt1" },
        { tag: "Caneca Geek", title: "Game Over", image: "gk47.jpg", url: "https://amzn.to/4e6Yhpj" },
        { tag: "Chaveiro Geek", title: "Grogu", image: "gk48.jpg", url: "https://amzn.to/4sQrBUI" },
        { tag: "Porta-chaves", title: "Awesome Mix", image: "gk49.jpg", url: "https://amzn.to/3QGPyQW" },
        { tag: "Chaveiro Geek", title: "Game Boy Retro", image: "gk50.jpg", url: "https://amzn.to/3QE7kEr" },
      ],
    },
  ];

  const container = document.querySelector("[data-geek-affiliate-catalog]");

  if (!(container instanceof HTMLElement)) {
    return;
  }

  const imageBasePath = "assets/img/mundo-geek/colecionaveis/catalogo/";
  const fragment = document.createDocumentFragment();

  for (const group of collectiblesCatalogGroups) {
    const groupSection = document.createElement("section");
    groupSection.className = "geek-affiliate-group";
    groupSection.id = group.id;
    groupSection.setAttribute("data-geek-reveal", "");

    const heading = document.createElement("div");
    heading.className = "geek-affiliate-group-heading";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = group.eyebrow;

    const title = document.createElement("h3");
    title.id = `${group.id}-title`;
    title.textContent = group.title;

    const description = document.createElement("p");
    description.textContent = group.description;

    heading.append(eyebrow, title, description);

    const grid = document.createElement("div");
    grid.className = "geek-affiliate-grid";

    for (const product of group.products) {
      const card = document.createElement("article");
      card.className = "geek-affiliate-card";

      const media = document.createElement("div");
      media.className = "geek-affiliate-card-media";

      const image = document.createElement("img");
      image.src = `${imageBasePath}${product.image}`;
      image.alt = `${product.title} em destaque no catalogo Colecionaveis Geek.`;
      image.loading = "lazy";
      image.decoding = "async";

      media.append(image);

      const body = document.createElement("div");
      body.className = "geek-affiliate-card-body";

      const tag = document.createElement("span");
      tag.className = "geek-affiliate-card-tag";
      tag.textContent = product.tag;

      const name = document.createElement("h4");
      name.textContent = product.title;

      const link = document.createElement("a");
      link.className = "button button-primary";
      link.href = product.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer sponsored";
      link.textContent = "Encontre Aqui";
      link.setAttribute("aria-label", `Encontre Aqui: ${product.title} na Amazon`);

      body.append(tag, name, link);
      card.append(media, body);
      grid.append(card);
    }

    groupSection.setAttribute("aria-labelledby", title.id);
    groupSection.append(heading, grid);
    fragment.append(groupSection);
  }

  container.append(fragment);
})();
