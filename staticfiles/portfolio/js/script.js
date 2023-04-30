document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// // Load saved theme from localStorage
// const savedTheme = localStorage.getItem('theme') || 'light';
// if (savedTheme === 'dark') {
//     document.documentElement.classList.add('dark');
// }


// const themeToggle = document.getElementById('theme-toggle');

// themeToggle.addEventListener('click', () => {
//     // Update the localStorage value
//     const currentTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
//     localStorage.setItem('theme', currentTheme);

//     // Add or remove the dark class based on the new value
//     if (currentTheme === 'dark') {
//         document.documentElement.classList.add('dark');
//     } else {
//         document.documentElement.classList.remove('dark');
//     }
// });




