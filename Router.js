/* ================================
   Learning With Fred – router.js
   Navigation + Screen Loader + Role Check
================================== */

console.log("Router loaded.");

// Smooth screen loader
function loadScreen(page) {
    const container = document.getElementById("app");

    if (!container) {
        window.location.href = page;
        return;
    }

    container.style.opacity = 0;

    setTimeout(() => {
        fetch(page)
            .then(res => res.text())
            .then(html => {
                container.innerHTML = html;
                container.style.opacity = 1;
                window.scrollTo(0, 0);
            });
    }, 180);
}

// Check user role (student / guest / none)
function getUser() {
    return JSON.parse(localStorage.getItem("lwfred_user") || "{}");
}

// Route protection for student-only pages
function requireStudent() {
    const u = getUser();
    if (!u.role || u.role !== "student") {
        window.location.href = "login.html";
    }
}

// Route protection for guest-only pages
function requireGuest() {
    const u = getUser();
    if (!u.role || u.role !== "guest") {
        window.location.href = "login.html";
    }
}

// Logout
function logout() {
    localStorage.removeItem("lwfred_user");
    window.location.href = "login.html";
}

// Navigation helper
function go(page) {
    window.location.href = page;
}

// Bottom navigation animation
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(n => {
        n.addEventListener("click", () => {
            navItems.forEach(x => x.classList.remove("active"));
            n.classList.add("active");
        });
    });
});

/* ================================
    App Initialization
================================== */

(function init() {
    const user = getUser();

    if (!user.role) {
        // No user → Go to onboarding
        if (!location.pathname.includes("onboarding")) {
            window.location.href = "onboarding.html";
        }
        return;
    }

    // Role-based redirects
    if (user.role === "student") {
        if (location.pathname.includes("guest")) {
            window.location.href = "student-home.html";
        }
    }

    if (user.role === "guest") {
        if (location.pathname.includes("student")) {
            window.location.href = "guest-home.html";
        }
    }
})();
