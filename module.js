async function activateDrawing(drawing) {
  const characterOptions = game.actors.entities.filter(a => a.data.type === "character").map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  const content = `
    <div>
      <label for="character-select">Select a character:</label>
      <select id="character-select">${characterOptions}</select>
    </div>
  `;
  const buttons = {
    yes: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Select Character',
      callback: () => {
        const selectedCharacterId = $('#character-select').val();
        drawing.data.flags = { 
          "unite-and-fight": { 
            "selectedCharacterId": selectedCharacterId 
          } 
        };
        canvas.updateEmbeddedDocuments("Drawing", [drawing.data]);
      }
    },
    no: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel'
    }
  };
  new Dialog({
    title: 'Select Character',
    content: content,
    buttons: buttons,
    default: 'yes'
  }).render(true);
}
