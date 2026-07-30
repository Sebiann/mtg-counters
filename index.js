const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
}

document.querySelectorAll('.keyword-row').forEach(row => {
    row.addEventListener('click', () => {
        const key = row.dataset.keyword;
        const details = document.querySelector(`.keyword-details[data-parent="${key}"]`);
        details.classList.toggle('open');
    });
});
