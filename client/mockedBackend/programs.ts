export type Program = {
  id: string;
  name: string;
  description: string;
  image_src: string;
  is_active: boolean;
};

const PROGRAMS: Program[] = [
  {
    id: 'informatyka-st',
    name: 'Informatyka — studia stacjonarne',
    description:
      'Kierunek łączy solidne podstawy informatyki z praktycznym programowaniem i projektowaniem systemów.\nAbsolwenci znajdują zatrudnienie jako programiści, analitycy danych oraz inżynierowie oprogramowania.',
    image_src: '/programs/informatyka-st.svg',
    is_active: true,
  },
  {
    id: 'zarzadzanie-np',
    name: 'Zarządzanie — studia niestacjonarne',
    description:
      'Studia dla osób planujących karierę managerską w małych i średnich organizacjach oraz w zespołach produktowych.\nProgram kładzie nacisk na zarządzanie zasobami ludzkimi, finansami operacyjnymi i strategią.',
    image_src: '/programs/zarzadzanie-np.svg',
    is_active: true,
  },
];

export function getPrograms(): Program[] {
  return PROGRAMS.filter((p) => p.is_active);
}

export function getProgramById(id: string): Program | null {
  return PROGRAMS.find((p) => p.id === id && p.is_active) ?? null;
}
