function updateTimeAndTheme() {
    const now = new Date();
    
    // Format Time
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = now.toLocaleTimeString(undefined, timeOptions);
    document.getElementById('time-display').textContent = timeString;

    // Format Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, dateOptions);
    document.getElementById('date-display').textContent = dateString;

    // Theme Logic: Light during day (6:00 - 17:59), Dark at night (18:00 - 5:59)
    const hour = now.getHours();
    const body = document.body;
    
    if (hour >= 6 && hour < 18) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }
}

// Initial call
updateTimeAndTheme();

// Update every second
setInterval(updateTimeAndTheme, 1000);
