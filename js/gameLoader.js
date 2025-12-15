// Game Loader Functions
function showGameLoader() {
  const gameLoader = document.getElementById('gameLoader');
  if (gameLoader) {
    gameLoader.style.display = 'flex';
  }
}

function hideGameLoader() {
  const gameLoader = document.getElementById('gameLoader');
  if (gameLoader) {
    gameLoader.style.display = 'none';
  }
}

// Enhanced handlePlayNow wrapper that shows loader
function handleGameClick(gameId, element) {
  showGameLoader();
  
  // Check if user is logged in
  if (localStorage.getItem('token')) {
    handlePlayNow(gameId, element?.id);
  } else {
    hideGameLoader();
    GameHallHandler.openLoginPopup(element);
  }
}