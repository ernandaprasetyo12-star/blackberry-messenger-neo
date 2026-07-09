const data = new Uint8Array([1, 2, 3]);
try {
  const view = new Uint8Array(data.slice(0));
  view.reverse();
  console.log("Success encrypt", view);
} catch (e) {
  console.log("Error encrypt", e);
}
