const SAVED_VET_KEY = 'petsneha_saved_vet';

export const getSavedVet = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(SAVED_VET_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setSavedVet = (vet) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!vet) {
    localStorage.removeItem(SAVED_VET_KEY);
    return;
  }

  localStorage.setItem(SAVED_VET_KEY, JSON.stringify(vet));
};