export async function loadSettings() {
  try {
    const raw = localStorage.getItem('synapse.ai.settings');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(data: unknown) {
  try {
    localStorage.setItem('synapse.ai.settings', JSON.stringify(data));
  } catch {

  }
}
