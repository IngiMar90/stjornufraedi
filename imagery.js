// NASA photographs are stored locally, without changing the source pixels.
// Frames only control their placement in the interface. See assets/CREDITS.md.
export const PLANET_IMAGES = {
  mercury: { width: 1024, frame: [279, 30, 512], credit: 'NASA / Johns Hopkins APL / Carnegie Institution of Washington', source: 'https://science.nasa.gov/photojournal/mercury-globe-0n-180e/' },
  venus: { width: 1024, frame: [250, 42, 492], credit: 'NASA / JPL-Caltech', source: 'https://science.nasa.gov/image-detail/venus-mariner-10-pia23791-fig2-2/' },
  earth: { width: 1024, frame: [294, 59, 454], credit: 'NASA / Apollo 17', source: 'https://science.nasa.gov/solar-system/planets/' },
  mars: { width: 1024, frame: [256, 18, 520], credit: 'NASA / JPL-Caltech', source: 'https://science.nasa.gov/solar-system/planets/' },
  jupiter: { width: 1024, frame: [254, 2, 544], credit: 'Kevin M. Gill (CC BY), NASA / JPL-Caltech / SwRI / MSSS', source: 'https://science.nasa.gov/photojournal/jupiter-marble/' },
  saturn: { width: 1024, frame: [60, -201, 900], globeFrame: [331, 64, 374], credit: 'NASA / JPL / Space Science Institute', source: 'https://science.nasa.gov/photojournal/saturn-four-years-on/' },
  uranus: { width: 1024, frame: [242, 18, 534], credit: 'NASA / JPL-Caltech', source: 'https://science.nasa.gov/solar-system/planets/' },
  neptune: { width: 1024, frame: [238, 27, 522], credit: 'NASA / JPL-Caltech', source: 'https://science.nasa.gov/solar-system/planets/' }
};
