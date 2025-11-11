// توابع مخصوص صفحه کاربر - نسخه اصلاح شده
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    // بررسی دسترسی
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'user') {
        window.location.href = '../index.html';
        return;
    }
    
    loadUserData();
});

function loadUserData() {
    document.getElementById('userName').textContent = currentUser.name;
    updateBalance();
    loadGifts();
    loadUserTransactions();
}

function updateBalance() {
    const balance = getUserBalance(currentUser.email);
    document.getElementById('userBalance').textContent = balance.toLocaleString() + ' واحد';
}

function loadGifts() {
    const giftsGrid = document.getElementById('giftsGrid');
    const balance = getUserBalance(currentUser.email);
    const gifts = getGifts();
    
    giftsGrid.innerHTML = '';
    
    if (gifts.length === 0) {
        giftsGrid.innerHTML = '<div class="no-data">هدیه‌ای موجود نیست</div>';
        return;
    }
    
    gifts.forEach(gift => {
        const canBuy = balance >= gift.price;
        const giftCard = document.createElement('div');
        giftCard.className = 'gift-card';
        giftCard.onclick = () => showGiftDetails(gift);
        
        giftCard.innerHTML = `
            <div class="gift-image">
                ${gift.image ? 
                    `<img src="${gift.image}" alt="${gift.name}" onerror="this.style.display='none'">` : 
                    '<i class="fas fa-gift"></i>'
                }
            </div>
            <div class="gift-info">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-description">${gift.description}</div>
                <div class="gift-price">
                    <span class="price-amount">${gift.price.toLocaleString()} واحد</span>
                    <button class="buy-btn" ${!canBuy ? 'disabled' : ''} onclick="event.stopPropagation(); buyGift(${gift.id})">
                        ${canBuy ? 'خرید' : 'موجودی کم'}
                    </button>
                </div>
            </div>
        `;
        
        giftsGrid.appendChild(giftCard);
    });
}

function showGiftDetails(gift) {
    const balance = getUserBalance(currentUser.email);
    const canBuy = balance >= gift.price;
    
    document.getElementById('giftModalTitle').textContent = gift.name;
    document.getElementById('giftModalContent').innerHTML = `
        <div style="text-align: center;">
            <div class="gift-image" style="margin-bottom: 20px;">
                ${gift.image ? 
                    `<img src="${gift.image}" alt="${gift.name}" style="border-radius: 10px;">` : 
                    '<i class="fas fa-gift" style="font-size: 80px;"></i>'
                }
            </div>
            <h4>${gift.name}</h4>
            <p style="color: #666; margin: 15px 0;">${gift.description}</p>
            <div style="font-size: 24px; font-weight: bold; color: var(--primary); margin: 20px 0;">
                ${gift.price.toLocaleString()} واحد
            </div>
            <p style="color: #666; margin: 10px 0;">موجودی شما: ${balance.toLocaleString()} واحد</p>
            <button class="btn ${canBuy ? 'btn-success' : 'btn-danger'}" style="width: 100%;" 
                    onclick="buyGift(${gift.id})" ${!canBuy ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i>
                ${canBuy ? 'خرید هدیه' : 'موجودی کافی نیست'}
            </button>
        </div>
    `;
    
    showModal('giftModal');
}

function buyGift(giftId) {
    const gift = getGifts().find(g => g.id === giftId);
    const balance = getUserBalance(currentUser.email);
    
    if (balance < gift.price) {
        alert('موجودی شما کافی نیست!');
        return;
    }
    
    if (confirm(`آیا از خرید "${gift.name}" به مبلغ ${gift.price.toLocaleString()} واحد اطمینان دارید؟`)) {
        // ثبت تراکنش خرید
        const transactions = getTransactions();
        const newTransaction = {
            id: Date.now(),
            email: currentUser.email,
            amount: -gift.price,
            type: 'خرید هدیه',
            description: `خرید ${gift.name}`,
            date: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR')
        };
        
        transactions.push(newTransaction);
        saveTransactions(transactions);
        
        updateBalance();
        loadGifts();
        loadUserTransactions();
        
        closeModal('giftModal');
        alert(`هدیه "${gift.name}" با موفقیت خریداری شد!`);
    }
}

function loadUserTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    const transactions = getTransactions();
    const userTransactions = transactions
        .filter(t => t.email === currentUser.email)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionsList.innerHTML = '';
    
    if (userTransactions.length === 0) {
        transactionsList.innerHTML = '<div class="transaction-item" style="text-align: center; color: #666;">تراکنشی یافت نشد</div>';
        return;
    }
    
    userTransactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        
        transactionEl.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.type}</h4>
                <p>${transaction.description}</p>
                <small>${transaction.date}</small>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
            </div>
        `;
        
        transactionsList.appendChild(transactionEl);
    });
}

function logout() {
    if (confirm('آیا می‌خواهید از سیستم خارج شوید؟')) {
        clearCurrentUser();
        window.location.href = '../index.html';
    }
}