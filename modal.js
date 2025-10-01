// Modal functionality for withdraw button
function submitWithdraw() {
  openModal();
}

function openModal() {
  const modal = document.getElementById("withdrawModal");
  if (modal) {
    modal.style.display = "block";
  }
}

function hideCurrentValues() {
  document.getElementById("modal-content").style.display = "none";
}

function closeModal() {
  const modal = document.getElementById("withdrawModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal1 = document.getElementById("withdrawModal");
  const modal2 = document.getElementById("secondModal");
  if (event.target === modal1) {
    closeModal();
  }
  if (event.target === modal2) {
    closeSecondModal();
  }
};

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
    closeSecondModal();
  }
});

function confirmWithdraw() {
  closeModal();
  openSecondModal();
}

function openTelegramLink() {
  window.open("https://t.me/csgasv388", "_blank");
}

function openSecondModal() {
  const modal = document.getElementById("secondModal");
  if (modal) {
    modal.style.display = "block";
  }
}

function closeSecondModal() {
  const modal = document.getElementById("secondModal");
  if (modal) {
    modal.style.display = "none";
  }
}
