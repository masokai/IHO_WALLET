// توابع مخصوص صفحه ادمین - نسخه کامل
let currentUser = null;
let editingGiftId = null;

document.addEventListener('DOMContentLoaded', function() {
    // بررسی دسترسی ادمین
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }
    
    loadAdminData();
});

function loadAdminData() {
    loadUsersList();
    loadGiftsManagement();
    loadAllTransactions();
}

function checkAdminAccess() {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// مدیریت کاربران
function loadUsersList() {
    if (!checkAdminAccess()) return;
    
    const usersList = document.getElementById('usersList');
    const users = getUsers();
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        if (user.role === 'user') {
            const balance = getUserBalance(user.email);
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            
            userEl.innerHTML = `
                <div style="display: flex; align-items: center;">
                    ${user.avatar ? 
                        `<img src="${user.avatar}" alt="${user.name}" class="user-avatar">` : 
                        '<div class="user-avatar" style="background: #ddd; display: flex; align-items: center; justify-content: center; color: #666;"><i class="fas fa-user"></i></div>'
                    }
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-balance">
                    ${balance.toLocaleString()} واحد
                </div>
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="editUser('${user.email}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser('${user.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            usersList.appendChild(userEl);
        }
    });
}

function showAddUserForm() {
    if (!checkAdminAccess()) return;
    
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('userAvatar').value = '';
    showModal('userModal');
}

function addNewUser() {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const avatarFile = document.getElementById('userAvatar').files[0];
    
    if (!name || !email || !password) {
        alert('لطفاً تمام فیلدهای ضروری را پر کنید!');
        return;
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('این ایمیل قبلاً ثبت شده است!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        email: email,
        password: password,
        name: name,
        role: 'user',
        avatar: null
    };
    
    if (avatarFile) {
        convertImageToBase64(avatarFile, (base64) => {
            newUser.avatar = base64;
            users.push(newUser);
            saveUsers(users);
            loadUsersList();
            closeModal('userModal');
            alert('کاربر با موفقیت افزوده شد!');
        });
    } else {
        users.push(newUser);
        saveUsers(users);
        loadUsersList();
        closeModal('userModal');
        alert('کاربر با موفقیت افزوده شد!');
    }
}

function editUser(email) {
    if (!checkAdminAccess()) return;
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserEmail').value = user.email;
        document.getElementById('newUserPassword').value = user.password;
        
        // تغییر عنوان مودال و دکمه
        document.querySelector('#userModal h3').textContent = 'ویرایش کاربر';
        const saveBtn = document.querySelector('#userModal .btn-primary');
        saveBtn.textContent = 'ذخیره تغییرات';
        saveBtn.onclick = function() { updateUser(email); };
        
        showModal('userModal');
    }
}

function updateUser(oldEmail) {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const avatarFile = document.getElementById('userAvatar').files[0];
    
    if (!name || !email || !password) {
        alert('لطفاً تمام فیلدهای ضروری را پر کنید!');
        return;
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === oldEmail);
    
    if (userIndex === -1) {
        alert('کاربر یافت نشد!');
        return;
    }
    
    // بررسی تکراری نبودن ایمیل جدید
    if (oldEmail !== email && users.find(u => u.email === email)) {
        alert('این ایمیل قبلاً توسط کاربر دیگری استفاده شده است!');
        return;
    }
    
    // به‌روزرسانی کاربر
    users[userIndex].name = name;
    users[userIndex].email = email;
    users[userIndex].password = password;
    
    // به‌روزرسانی تراکنش‌های کاربر
    const transactions = getTransactions();
    transactions.forEach(transaction => {
        if (transaction.email === oldEmail) {
            transaction.email = email;
        }
    });
    saveTransactions(transactions);
    
    if (avatarFile) {
        convertImageToBase64(avatarFile, (base64) => {
            users[userIndex].avatar = base64;
            saveUsers(users);
            loadUsersList();
            closeModal('userModal');
            alert('کاربر با موفقیت ویرایش شد!');
        });
    } else {
        saveUsers(users);
        loadUsersList();
        closeModal('userModal');
        alert('کاربر با موفقیت ویرایش شد!');
    }
}

function deleteUser(email) {
    if (!checkAdminAccess()) return;
    
    if (!confirm(`آیا از حذف این کاربر اطمینان دارید؟\nتمام تراکنش‌های کاربر نیز حذف خواهند شد.`)) {
        return;
    }
    
    const users = getUsers();
    const updatedUsers = users.filter(u => u.email !== email);
    
    // حذف تراکنش‌های کاربر
    const transactions = getTransactions();
    const updatedTransactions = transactions.filter(t => t.email !== email);
    
    saveUsers(updatedUsers);
    saveTransactions(updatedTransactions);
    
    loadUsersList();
    loadAllTransactions();
    alert('کاربر با موفقیت حذف شد!');
}

// مدیریت هدایا
function loadGiftsManagement() {
    if (!checkAdminAccess()) return;
    
    const giftsList = document.getElementById('giftsManagementList');
    const gifts = getGifts();
    
    giftsList.innerHTML = '';
    
    if (gifts.length === 0) {
        giftsList.innerHTML = '<div class="no-data">هدیه‌ای موجود نیست</div>';
        return;
    }
    
    gifts.forEach(gift => {
        const giftEl = document.createElement('div');
        giftEl.className = 'gift-management-item';
        
        giftEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="gift-image" style="width: 80px; height: 80px;">
                    ${gift.image ? 
                        `<img src="${gift.image}" alt="${gift.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 
                        '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; border-radius: 8px;"><i class="fas fa-gift"></i></div>'
                    }
                </div>
                <div class="gift-details">
                    <h4>${gift.name}</h4>
                    <p>${gift.description}</p>
                    <div style="color: var(--primary); font-weight: bold; margin-top: 5px;">
                        ${gift.price.toLocaleString()} واحد
                    </div>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary" onclick="editGift(${gift.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteGift(${gift.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        giftsList.appendChild(giftEl);
    });
}

function showAddGiftForm() {
    if (!checkAdminAccess()) return;
    
    editingGiftId = null;
    document.getElementById('giftFormTitle').textContent = 'افزودن هدیه جدید';
    document.getElementById('giftName').value = '';
    document.getElementById('giftPrice').value = '';
    document.getElementById('giftDescription').value = '';
    document.getElementById('giftImage').value = '';
    
    const saveBtn = document.querySelector('#giftFormModal .btn-primary');
    saveBtn.textContent = 'ذخیره هدیه';
    saveBtn.onclick = function() { saveGift(); };
    
    showModal('giftFormModal');
}

function editGift(giftId) {
    if (!checkAdminAccess()) return;
    
    const gifts = getGifts();
    const gift = gifts.find(g => g.id === giftId);
    
    if (gift) {
        editingGiftId = giftId;
        document.getElementById('giftFormTitle').textContent = 'ویرایش هدیه';
        document.getElementById('giftName').value = gift.name;
        document.getElementById('giftPrice').value = gift.price;
        document.getElementById('giftDescription').value = gift.description;
        
        const saveBtn = document.querySelector('#giftFormModal .btn-primary');
        saveBtn.textContent = 'ذخیره تغییرات';
        saveBtn.onclick = function() { saveGift(); };
        
        showModal('giftFormModal');
    }
}

function saveGift() {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('giftName').value;
    const price = parseFloat(document.getElementById('giftPrice').value);
    const description = document.getElementById('giftDescription').value;
    const imageFile = document.getElementById('giftImage').files[0];
    
    if (!name || !price) {
        alert('لطفاً نام و قیمت هدیه را وارد کنید!');
        return;
    }
    
    if (price <= 0) {
        alert('قیمت هدیه باید بیشتر از صفر باشد!');
        return;
    }
    
    const gifts = getGifts();
    
    if (editingGiftId) {
        // ویرایش هدیه موجود
        const giftIndex = gifts.findIndex(g => g.id === editingGiftId);
        
        if (giftIndex === -1) {
            alert('هدیه مورد نظر یافت نشد!');
            return;
        }
        
        gifts[giftIndex].name = name;
        gifts[giftIndex].price = price;
        gifts[giftIndex].description = description;
        
        if (imageFile) {
            convertImageToBase64(imageFile, (base64) => {
                gifts[giftIndex].image = base64;
                saveGifts(gifts);
                loadGiftsManagement();
                closeModal('giftFormModal');
                alert('هدیه با موفقیت ویرایش شد!');
                resetGiftForm();
            });
        } else {
            saveGifts(gifts);
            loadGiftsManagement();
            closeModal('giftFormModal');
            alert('هدیه با موفقیت ویرایش شد!');
            resetGiftForm();
        }
    } else {
        // افزودن هدیه جدید
        const newGift = {
            id: Date.now(),
            name: name,
            price: price,
            description: description,
            image: null
        };
        
        if (imageFile) {
            convertImageToBase64(imageFile, (base64) => {
                newGift.image = base64;
                gifts.push(newGift);
                saveGifts(gifts);
                loadGiftsManagement();
                closeModal('giftFormModal');
                alert('هدیه با موفقیت افزوده شد!');
                resetGiftForm();
            });
        } else {
            gifts.push(newGift);
            saveGifts(gifts);
            loadGiftsManagement();
            closeModal('giftFormModal');
            alert('هدیه با موفقیت افزوده شد!');
            resetGiftForm();
        }
    }
}

function resetGiftForm() {
    editingGiftId = null;
    document.getElementById('giftName').value = '';
    document.getElementById('giftPrice').value = '';
    document.getElementById('giftDescription').value = '';
    document.getElementById('giftImage').value = '';
}

function deleteGift(giftId) {
    if (!checkAdminAccess()) return;
    
    if (!confirm('آیا از حذف این هدیه اطمینان دارید؟')) {
        return;
    }
    
    const gifts = getGifts();
    const updatedGifts = gifts.filter(g => g.id !== giftId);
    
    saveGifts(updatedGifts);
    loadGiftsManagement();
    alert('هدیه با موفقیت حذف شد!');
}

// مدیریت تراکنش‌ها
function loadAllTransactions() {
    if (!checkAdminAccess()) return;
    
    const transactionsList = document.getElementById('allTransactionsList');
    const transactions = getTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<div class="transaction-item" style="text-align: center; color: #666;">تراکنشی یافت نشد</div>';
        return;
    }
    
    transactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        
        transactionEl.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.type}</h4>
                <p>${transaction.description}</p>
                <small>${transaction.email} - ${transaction.date}</small>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
            </div>
        `;
        
        transactionsList.appendChild(transactionEl);
    });
}

function addCreditToUser() {
    if (!checkAdminAccess()) return;
    
    const userSelect = document.getElementById('creditUserSelect');
    const users = getUsers().filter(u => u.role === 'user');
    
    userSelect.innerHTML = '';
    
    if (users.length === 0) {
        userSelect.innerHTML = '<option value="">کاربری موجود نیست</option>';
        alert('هیچ کاربری برای افزودن اعتبار وجود ندارد!');
        return;
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.email;
        option.textContent = `${user.name} (${user.email}) - موجودی: ${getUserBalance(user.email).toLocaleString()} واحد`;
        userSelect.appendChild(option);
    });
    
    document.getElementById('creditAmount').value = '';
    document.getElementById('creditDescription').value = '';
    showModal('creditModal');
}

function addCredit() {
    if (!checkAdminAccess()) return;
    
    const userEmail = document.getElementById('creditUserSelect').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    const description = document.getElementById('creditDescription').value;
    
    if (!userEmail) {
        alert('لطفاً یک کاربر انتخاب کنید!');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('لطفاً مقدار اعتبار را به درستی وارد کنید!');
        return;
    }
    
    const transactions = getTransactions();
    const newTransaction = {
        id: Date.now(),
        email: userEmail,
        amount: amount,
        type: 'افزودن اعتبار',
        description: description || 'افزودن اعتبار توسط مدیر',
        date: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR')
    };
    
    transactions.push(newTransaction);
    saveTransactions(transactions);
    
    loadAllTransactions();
    loadUsersList();
    closeModal('creditModal');
    alert(`اعتبار ${amount.toLocaleString()} واحدی با موفقیت به کاربر افزوده شد!`);
}

// توابع تب‌ها
function showAdminTab(tabId) {
    if (!checkAdminAccess()) return;
    
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    
    // بارگذاری مجدد داده‌های تب فعال
    switch(tabId) {
        case 'usersTab':
            loadUsersList();
            break;
        case 'giftsTab':
            loadGiftsManagement();
            break;
        case 'transactionsTab':
            loadAllTransactions();
            break;
    }
}

function logout() {
    if (confirm('آیا می‌خواهید از سیستم خارج شوید؟')) {
        clearCurrentUser();
        window.location.href = '../index.html';
    }
}

// توابع کمکی
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// بستن مودال با کلیک خارج از آن
window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

}
// تست مستقیم API
console.log('🔍 تست API...');

// تست دریافت کاربران
try {
    const users = await api.getUsers();
    console.log('✅ کاربران:', users);
} catch (error) {
    console.error('❌ خطا در دریافت کاربران:', error);
}

// تست دریافت هدایا
try {
    const gifts = await api.getGifts();
    console.log('✅ هدایا:', gifts);
} catch (error) {
    console.error('❌ خطا در دریافت هدایا:', error);
}
