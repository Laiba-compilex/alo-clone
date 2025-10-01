// Import the withdraw APIs
import { 
    APIWithdrawRequest, 
    withdrawAllowed, 
    getBankAccountsApi,
    singleTransactionStatusCheck 
} from './withdrawApis.js';

class WithdrawManager {
    constructor() {
        this.bankAccounts = [];
        this.selectedBank = null;
        this.init();
    }

    async init() {
        await this.checkWithdrawAllowed();
        await this.loadBankAccounts();
        this.setupEventListeners();
    }

    async checkWithdrawAllowed() {
        try {
            const response = await withdrawAllowed();
            if (!response.data.allowed) {
                this.showError('Withdraw is currently not allowed');
                return false;
            }
            return true;
        } catch (error) {
            this.showError('Failed to check withdraw status');
            return false;
        }
    }

    async loadBankAccounts() {
        try {
            const response = await getBankAccountsApi();
            this.bankAccounts = response.data || [];
            this.renderBankAccounts();
        } catch (error) {
            console.error('Failed to load bank accounts:', error);
        }
    }

    renderBankAccounts() {
        const container = document.getElementById('bank-accounts-container');
        if (!container) return;

        container.innerHTML = this.bankAccounts.map(account => `
            <div class="bank-account-item" data-id="${account.id}">
                <div class="bank-info">
                    <strong>${account.bank_name}</strong>
                    <div>${account.account_number} - ${account.account_holder}</div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Amount input
        const amountInput = document.getElementById('withdraw-amount');
        if (amountInput) {
            amountInput.addEventListener('input', this.validateAmount.bind(this));
        }

        // Bank account selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bank-account-item')) {
                this.selectBankAccount(e.target.closest('.bank-account-item'));
            }
        });

        // Withdraw button
        const withdrawBtn = document.getElementById('withdraw-btn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', this.makeWithdraw.bind(this));
        }
    }

    selectBankAccount(element) {
        document.querySelectorAll('.bank-account-item').forEach(item => 
            item.classList.remove('selected'));
        element.classList.add('selected');
        
        this.selectedBank = {
            id: element.dataset.id
        };
    }

    validateAmount(e) {
        const amount = parseFloat(e.target.value);
        const errorElement = document.getElementById('amount-error');
        
        if (amount < 100000) {
            errorElement.textContent = 'Minimum withdraw is 100,000 VND';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    async makeWithdraw() {
        const amount = document.getElementById('withdraw-amount').value;
        
        if (!this.validateWithdraw(amount)) return;

        const withdrawBtn = document.getElementById('withdraw-btn');
        withdrawBtn.disabled = true;
        withdrawBtn.textContent = 'Processing...';

        try {
            const result = await APIWithdrawRequest(
                amount,
                this.selectedBank.id
            );

            if (result === 'INSUFFICIENT_BALANCE') {
                this.showError('Insufficient balance for withdrawal.');
            } else if (result === 'DAILY_LIMIT_EXCEEDED') {
                this.showError('Daily withdrawal limit exceeded.');
            } else if (result === 'BANK_ACCOUNT_NOT_VERIFIED') {
                this.showError('Bank account not verified.');
            } else if (result === 'WITHDRAWAL_NOT_ALLOWED') {
                this.showError('Withdrawal not allowed at this time.');
            } else if (result) {
                this.showSuccess('Withdrawal request created successfully!');
                this.showTransactionDetails(result);
            } else {
                this.showError('Failed to create withdrawal request.');
            }
        } catch (error) {
            this.showError('An error occurred. Please try again.');
        } finally {
            withdrawBtn.disabled = false;
            withdrawBtn.textContent = 'Rút Tiền';
        }
    }

    validateWithdraw(amount) {
        if (!amount || parseFloat(amount) < 100000) {
            this.showError('Please enter a valid amount (minimum 100,000 VND)');
            return false;
        }

        if (!this.selectedBank) {
            this.showError('Please select a bank account');
            return false;
        }

        return true;
    }

    showTransactionDetails(transaction) {
        const modal = document.getElementById('transaction-modal');
        const details = document.getElementById('transaction-details');
        
        details.innerHTML = `
            <h3>Withdrawal Request Created</h3>
            <p><strong>Transaction ID:</strong> ${transaction.id}</p>
            <p><strong>Amount:</strong> ${transaction.amount} VND</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p><strong>Processing Time:</strong> 1-3 business days</p>
        `;
        
        modal.style.display = 'block';
        
        // Start checking transaction status
        this.checkTransactionStatus(transaction.id);
    }

    async checkTransactionStatus(transactionId) {
        const checkStatus = async () => {
            try {
                const result = await singleTransactionStatusCheck(transactionId);
                if (result && result.status === 'completed') {
                    this.showSuccess('Withdrawal completed successfully!');
                    return;
                }
                setTimeout(checkStatus, 10000); // Check every 10 seconds
            } catch (error) {
                console.error('Status check failed:', error);
            }
        };
        
        checkStatus();
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => errorElement.style.display = 'none', 5000);
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            setTimeout(() => successElement.style.display = 'none', 5000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WithdrawManager();
});