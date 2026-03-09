export function pad(n) {
  return n.toString().padStart(2, "0");
}

export function nowString() {

  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} `
       + `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}