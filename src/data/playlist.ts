export interface Track {
  title: string;
  artist: string;
  src: string;
}

export const PLAYLIST: Track[] = [
  { title: 'Calvera', artist: 'fyodor', src: '/audio/calvera.mp3' },
  { title: 'Ebb Tide', artist: 'Ben Flocks', src: '/audio/ebb-tide.mp3' },
  {
    title: "Raining but It's Ok",
    artist: 'dublon, Tour-Maubourg & manon',
    src: '/audio/raining-but-its-ok.mp3'
  }
];
