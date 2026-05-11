export type Program = {
  id: string;
  name: string;
  description: string;
  image_src: string;
  is_active: boolean;
};

const PROGRAMS: Program[] = [
  {
    id: 'metody-wytwarzania-oprogramowania',
    name: 'Metody Wytwarzania Oprogramowania',
    description:
      'Metody Wytwarzania Oprogramowania opis',
    image_src: '/programs/metody-wytwarzania-oprogramowania.jpg',
    is_active: true,
  },
  {
    id: 'analiza-danych-data-science',
    name: 'Analiza Danych - Data Science',
    description:
      'Analiza Danych - Data Science opis',
    image_src: '/programs/analiza-danych-data-science.jpg',
    is_active: true,
  },
  {
    id: 'systemy-baz-danych',
    name: 'Systemy Baz Danych',
    description:
      'Systemy Baz Danych opis',
    image_src: '/programs/systemy-baz-danych.jpg',
    is_active: true,
  },
  {
    id: 'cyberbezpieczenstwo-w-praktyce',
    name: 'Cyberbezpieczeństwo w praktyce',
    description:
      'Cyberbezpieczeństwo w praktyce opis',
    image_src: '/programs/cyberbezpieczenstwo-w-praktyce.jpg',
    is_active: true,
  },
  {
    id: 'systemy-erp-sap-s-4hana',
    name: 'Systemy ERP - ścieżka SAP S/4HANA',
    description:
      'Systemy ERP - ścieżka SAP S/4HANA opis',
    image_src: '/programs/systemy-erp-sap-s-4hana.png',
    is_active: true,
  },
  {
    id: 'systemy-erp-sciezka-inzynieria-oprogramowania-dla-sap-hana-erp-i-programowanie-w-jezyku-abap',
    name: 'Systemy ERP - ścieżka Inżynieria oprogramowania dla SAP (HANA) ERP i programowanie w języku ABAP',
    description:
      'Systemy ERP - ścieżka Inżynieria oprogramowania dla SAP (HANA) ERP i programowanie w języku ABAP opis',
    image_src: '/programs/systemy-erp-sciezka-inzynieria-oprogramowania-dla-sap-hana-erp-i-programowanie-w-jezyku-abap.png',
    is_active: true,
  },
  {
    id: 'systemy-erp-sciezka-analiza-biznesowa-w-systemach-erp-oraz-bi-business-intelligence-information-management',
    name: ' Systemy ERP - ścieżka Analiza biznesowa w systemach ERP oraz BI (Business Intelligence & Information Management)',
    description:
      'Systemy ERP - ścieżka Analiza biznesowa w systemach ERP oraz BI (Business Intelligence & Information Management) opis',
    image_src: '/programs/systemy-erp-sciezka-analiza-biznesowa-w-systemach-erp-oraz-bi-business-intelligence-information-management.png',
    is_active: true,
  },
    {
    id: 'podstawy-analityki-danych-w-biznesie',
    name: 'Podstawy analityki danych w biznesie',
    description:
      'Podstawy analityki danych w biznesie opis',
    image_src: '/programs/podstawy-analityki-danych-w-biznesie.jpg',
    is_active: true,
  },
    {
    id: 'uczenie-maszynowe-w-analityce-danych',
    name: 'Uczenie maszynowe w analityce danych',
    description:
      'Uczenie maszynowe w analityce danych opis',
    image_src: '/programs/uczenie-maszynowe-w-analityce-danych.jpg',
    is_active: true,
  },
    {
    id: 'inzynieria-systemow-sztucznej-inteligencji',
    name: 'Inżynieria systemów sztucznej inteligencji',
    description:
      'Inżynieria systemów sztucznej inteligencji opis',
    image_src: '/programs/inzynieria-systemow-sztucznej-inteligencji.jpg',
    is_active: true,
  },
    {
    id: 'analiza-kryminalna',
    name: 'Analiza kryminalna',
    description:
      'Analiza kryminalna opis',
    image_src: '/programs/analiza-kryminalna.jpg',
    is_active: true,
  },
];

export function getPrograms(): Program[] {
  return PROGRAMS.filter((p) => p.is_active);
}

export function getProgramById(id: string): Program | null {
  return PROGRAMS.find((p) => p.id === id && p.is_active) ?? null;
}
