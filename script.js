// Simple JavaScript for cli-mate.help
document.addEventListener('DOMContentLoaded', function() {
    console.log('cli-mate.help loaded');
    
    // Add a simple welcome message
    const content = document.querySelector('.content');
    if (content) {
        const welcomeMsg = document.createElement('p');
        welcomeMsg.textContent = 'need credible!! the fastest way to gain credibility is to find someone credible and translate their formal information to the relevant peeps!';
        welcomeMsg.style.marginTop = '3em';
        content.appendChild(welcomeMsg);
    }
});
