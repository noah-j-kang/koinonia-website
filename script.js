document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileBtn && navList) {
        mobileBtn.addEventListener('click', () => {
            const isVisible = navList.style.display === 'flex';

            if (isVisible) {
                navList.style.display = '';
            } else {
                navList.style.display = 'flex';
                navList.style.flexDirection = 'column';
                navList.style.position = 'absolute';
                navList.style.top = '100%';
                navList.style.left = '0';
                navList.style.width = '100%';
                navList.style.backgroundColor = 'white';
                navList.style.padding = '1rem';
                navList.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                navList.style.borderBottom = '1px solid #e5e7eb';
            }
        });
    }
});
