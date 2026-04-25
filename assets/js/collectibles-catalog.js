(() => {
  const collectiblesCatalogGroups = [
    {
      id: "figuras-vitrine",
      eyebrow: "Figuras",
      title: "Action Figures e Pecas de Vitrine",
      description:
        "Selecao para quem quer presenca visual forte, personagens iconicos e pecas que sustentam o clima do setup.",
      products: [
        { tag: "Action Figure", title: "Medicom Toy John Wick: Chapter 3 - Parabellum MAFEX", image: "gk50.jpg", url: "https://amzn.to/3QE7kEr" },
        { tag: "Marvel Select", title: "Thanos - Infinity Saga - Marvel Select", image: "gk49.jpg", url: "https://amzn.to/3QGPyQW" },
        { tag: "Action Figure", title: "Dark Horse Joel - The Last of Us Part II", image: "gk48.jpg", url: "https://amzn.to/4sQrBUI" },
        { tag: "Action Figure", title: "McFarlane Toys Shao Kahn - Mortal Kombat Platinum Kahn", image: "gk47.jpg", url: "https://amzn.to/4e6Yhpj" },
        { tag: "Action Figure", title: "McFarlane Reptile - Mortal Kombat Klassics WV2", image: "gk46.jpg", url: "https://amzn.to/4tr9Dt1" },
        { tag: "Action Figure", title: "McFarlane Raiden - Mortal Kombat Klassics WV2", image: "gk45.jpg", url: "https://amzn.to/3OGsXDq" },
        { tag: "Action Figure", title: "Street Fighter II Chun-Li 6-inch Action Figure", image: "gk44.jpg", url: "https://amzn.to/4ttpsPP" },
        { tag: "Action Figure", title: "Jada Toys Street Fighter II Ken 6-inch Action Figure", image: "gk43.jpg", url: "https://amzn.to/4cNZ1gN" },
        { tag: "Action Figure", title: "Star Wars The Black Series Obi-Wan Kenobi", image: "gk40.jpg", url: "https://amzn.to/41RXoty" },
        { tag: "Action Figure", title: "Dragon Stars Series Dragon Ball DAIMA Goku Mini", image: "gk39.jpg", url: "https://amzn.to/3QrGX4E" },
        { tag: "Pack Colecionavel", title: "PlayStation The Last of Us Joel e Ellie 2-Pack", image: "gk38.jpg", url: "https://amzn.to/4cvOnwp" },
        { tag: "Action Figure", title: "Blokees Saint Seiya Pegasus Seiya Champion Class", image: "gk37.jpg", url: "https://amzn.to/4tBxZR8" },
        { tag: "Estatua Premium", title: "Goku Genki Dama com LED", image: "gk36.jpg", url: "https://amzn.to/4u4H6th" },
        { tag: "Action Figure", title: "PlayStation Ghost of Tsushima Jin Sakai Samurai", image: "gk35.jpg", url: "https://amzn.to/4mPNcva" },
        { tag: "Miniaturas", title: "Naruto e Sasuke Mini Action Figures Pack", image: "gk34.jpg", url: "https://amzn.to/4d0iufs" },
        { tag: "Star Wars", title: "The Vintage Collection The Mandalorian e Grogu Deluxe", image: "gk32.jpg", url: "https://amzn.to/3OpJTy9" },
      ],
    },
    {
      id: "funko-plush",
      eyebrow: "Funko & Plush",
      title: "Funko Pop, Pelucias e Achados de Personagem",
      description:
        "Pecas leves para presente, colecao rapida e composicao de estante com nostalgia, humor e cultura pop reconhecivel.",
      products: [
        { tag: "Funko Pop", title: "Candide Funko POP! Homem-Aranha Amigao da Vizinhanca", image: "gk21.jpg", url: "https://amzn.to/4cEOB2T" },
        { tag: "Funko Pop", title: "Candide Funko POP! Rumi - Guerreiras do K-Pop", image: "gk22.jpg", url: "https://amzn.to/4mKvVmW" },
        { tag: "Funko Pop", title: "Candide Funko POP! Rumi - Guerreiras do K-Pop", image: "gk23.jpg", url: "https://amzn.to/4mKvVmW" },
        { tag: "Funko Pop", title: "Boneco Funko Pop! NBA Bulls - Michael Jordan", image: "gk24.jpg", url: "https://amzn.to/4ubjAuS" },
        { tag: "Funko Pop", title: "Candide Funko POP! Harry Potter com Edwiges", image: "gk25.jpg", url: "https://amzn.to/42v9NUg" },
        { tag: "Funko Pop", title: "Candide Funko POP! Mandaloriano com Grogu", image: "gk26.jpg", url: "https://amzn.to/48Pevjo" },
        { tag: "Funko Pop", title: "Candide Funko POP! Ayrton Senna Racing Lotus", image: "gk27.jpg", url: "https://amzn.to/4d2Nlbf" },
        { tag: "Funko Pop", title: "Candide Funko POP! Ayrton Senna Racing McLaren", image: "gk28.jpg", url: "https://amzn.to/490d81h" },
        { tag: "Pelucia", title: "Pelucia Disney Mickey Mouse Divirta-se", image: "gk20.jpg", url: "https://amzn.to/4tGhDGA" },
        { tag: "Fandom Box", title: "Fandombox Ratinho Ra-Tim-Bum", image: "gk31.jpg", url: "https://amzn.to/3OGqPvq" },
        { tag: "Pelucia", title: "Pelucia Grogu com Armadura Beskar", image: "gk42.jpg", url: "https://amzn.to/3QppZ72" },
      ],
    },
    {
      id: "lego-builders",
      eyebrow: "LEGO",
      title: "LEGO, Construcao e Sets de Display",
      description:
        "Montagens para quem curte exibir o processo criativo na mesa, no escritorio ou em uma vitrine geek mais arquitetada.",
      products: [
        { tag: "LEGO Creator", title: "LEGO Creator Onibus Espacial 3 em 1", image: "gk13.jpg", url: "https://amzn.to/4epkS0H" },
        { tag: "LEGO Marvel", title: "LEGO Marvel Homem-Aranha vs Motocicleta Fantasma", image: "gk14.jpg", url: "https://amzn.to/3OVatiK" },
        { tag: "LEGO Technic", title: "LEGO Technic Motocicleta Amarela", image: "gk15.jpg", url: "https://amzn.to/4u3sLND" },
        { tag: "LEGO Icons", title: "LEGO Icons McLaren MP4/4 e Ayrton Senna", image: "gk16.jpg", url: "https://amzn.to/3OBmuKa" },
        { tag: "LEGO Marvel", title: "LEGO Marvel Homem-Aranha vs Sandman", image: "gk17.jpg", url: "https://amzn.to/4vOI5Q2" },
        { tag: "LEGO Sonic", title: "LEGO Sonic Speedster Lightning", image: "gk19.jpg", url: "https://amzn.to/41NEqEp" },
        { tag: "LEGO FIFA", title: "LEGO Editions Trofeu Oficial da Copa do Mundo FIFA", image: "gk18.jpg", url: "https://amzn.to/4e1KAbh" },
      ],
    },
    {
      id: "decor-lifestyle",
      eyebrow: "Decor & Lifestyle",
      title: "Decoracao Geek, Utilidades e Presente Criativo",
      description:
        "Objetos de uso diario, humor visual e detalhes de ambiente para deixar o universo geek presente mesmo fora da prateleira.",
      products: [
        { tag: "Chaveiro Geek", title: "Chaveiro Geek Emborrachado Game Boy", image: "gk01.jpg", url: "https://amzn.to/4tx6yry" },
        { tag: "Porta-chaves", title: "Porta-Chaves Awesome Mixtape", image: "gk02.jpg", url: "https://amzn.to/48Sd6bP" },
        { tag: "Chaveiro Geek", title: "Chaveiro Geek Emborrachado Baby Yoda", image: "gk03.jpg", url: "https://amzn.to/4e6PyU5" },
        { tag: "Caneca Geek", title: "Caneca Geek Game Over Preta", image: "gk04.jpg", url: "https://amzn.to/42pMhbg" },
        { tag: "Caneca Geek", title: "Caneca Dinossauro Offline Programador", image: "gk05.jpg", url: "https://amzn.to/4u0VqCX" },
        { tag: "Caneca Geek", title: "Caneca Geek Dev Programador Python New", image: "gk06.jpg", url: "https://amzn.to/4w3olZ8" },
        { tag: "Porta-chaves", title: "Fabrica Geek Porta-Chaves Alohomora", image: "gk07.jpg", url: "https://amzn.to/4sWMT2V" },
        { tag: "Porta-copos", title: "Porta-copos Geek O Senhor dos Aneis", image: "gk08.jpg", url: "https://amzn.to/48P94ku" },
        { tag: "Porta-copos", title: "Porta-copos Geek Super-Herois", image: "gk11.jpg", url: "https://amzn.to/4mMHhHl" },
        { tag: "Cinema Geek", title: "Balde Pipoca Zumbi 3,5 Litros", image: "gk12.jpg", url: "https://amzn.to/4vOadCO" },
        { tag: "Porta-chaves", title: "Porta-Chaves Placa Ch4v3s", image: "gk09.jpg", url: "https://amzn.to/4sQjdVe" },
        { tag: "Porta-copos", title: "Porta-copos Geek Disquete Classic", image: "gk10.jpg", url: "https://amzn.to/41NRlpQ" },
        { tag: "Luminaria 3D", title: "PopLumos Luminaria LED 3D Darth Vader", image: "gk41.jpg", url: "https://amzn.to/4cNYLhP" },
        { tag: "Miniatura Die-Cast", title: "Carrinho Miniatura Herbie Classico 53", image: "gk29.jpg", url: "https://amzn.to/4txcVes" },
        { tag: "Decoracao Geek", title: "Decorativo Alienigena Verde com Shorts Laranja", image: "gk30.jpg", url: "https://amzn.to/4cw4Gcs" },
        { tag: "Camiseta Geek", title: "Camiseta Omega Ragnarok God of War", image: "gk33.jpg", url: "https://amzn.to/4w3uLrc" },
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
