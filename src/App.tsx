import { useState, useEffect, useRef } from 'react';
import {
  Home,
  Clock,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Bitcoin,
  X,
  Send,
  Bot,
  ChevronRight,
} from 'lucide-react';

type Tab = 'home' | 'activity' | 'pay' | 'ai';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  note: string;
  date: string;
  recipient?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'sent', amount: 120, note: 'Dinner with friends', date: 'Today', recipient: 'Sarah M.' },
  { id: '2', type: 'sent', amount: 35, note: 'Uber Ride', date: 'Today', recipient: 'Uber' },
  { id: '3', type: 'received', amount: 500, note: 'Freelance payment', date: 'Yesterday', recipient: 'Client XYZ' },
  { id: '4', type: 'sent', amount: 85, note: 'Groceries at Whole Foods', date: 'Yesterday', recipient: 'Whole Foods' },
  { id: '5', type: 'sent', amount: 45, note: 'Coffee meetings', date: 'Jun 28', recipient: 'Blue Bottle' },
  { id: '6', type: 'sent', amount: 200, note: 'Concert tickets', date: 'Jun 27', recipient: 'Ticketmaster' },
];

const weeklySpending = {
  dining: 250,
  transport: 120,
  entertainment: 180,
  utilities: 350,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [balance, setBalance] = useState(12450.0);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAssessment, setAiAssessment] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your PaySense Co-Pilot. I help you understand your spending in context and make smarter financial decisions. Ask me anything about your money habits!`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleKeypadPress = (value: string) => {
    if (value === 'del') {
      setPayAmount((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!payAmount.includes('.')) {
        setPayAmount((prev) => prev + '.');
      }
    } else {
      if (payAmount.includes('.')) {
        const decimals = payAmount.split('.')[1];
        if (decimals && decimals.length >= 2) return;
      }
      setPayAmount((prev) => prev + value);
    }
  };

  const generateAIAssessment = (amount: number, note: string): string => {
    const lowerNote = note.toLowerCase();
    const weeklyTotal = transactions
      .filter((t) => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);

    if (lowerNote.includes('dinner') || lowerNote.includes('lunch') || lowerNote.includes('food') || lowerNote.includes('cafe') || lowerNote.includes('drinks') || lowerNote.includes('restaurant')) {
      const equivalent = Math.round(amount / 40);
      return `You've spent $${weeklySpending.dining} on dining this week. This $${amount.toFixed(0)} transfer equals ${equivalent > 0 ? equivalent : 1} more restaurant visits. Put this into your Cash App Index Fund instead?\n\nYour dining budget is trending 18% above your monthly average. Consider: investing 50% of this amount could grow to $${(amount * 0.5 * 1.12).toFixed(0)} in a year.`;
    }

    if (lowerNote.includes('uber') || lowerNote.includes('lyft') || lowerNote.includes('ride') || lowerNote.includes('transport')) {
      return `Transport spending: $${weeklySpending.transport} this week. This $${amount.toFixed(0)} ride is ${Math.round((amount / weeklySpending.transport) * 100)}% of your weekly transport budget.\n\nTip: Consider public transit for routine trips to save ~$${Math.round(amount * 0.6)} per ride.`;
    }

    if (lowerNote.includes('rent') || lowerNote.includes('bill') || lowerNote.includes('utility') || lowerNote.includes('electric') || lowerNote.includes('internet')) {
      return `This is a fixed necessity. Great job keeping your bills organized! You've stayed within budget for utilities this month.\n\nYour bill payments are on track. Keep it up!`;
    }

    if (lowerNote.includes('grocery') || lowerNote.includes('food') || lowerNote.includes('market')) {
      return `Groceries are a smart spend category. You're currently at $${Math.round(weeklySpending.dining * 0.3)} for groceries this week, which is 12% under your budget.\n\nThis $${amount.toFixed(0)} purchase keeps you on track for your monthly grocery goal.`;
    }

    return `This $${amount.toFixed(0)} transaction represents ${(amount / balance * 100).toFixed(1)}% of your current balance.\n\nYour weekly spending total: $${weeklyTotal}. You're currently on track to save ${Math.max(0, 20 - ((weeklyTotal + amount) / balance * 100)).toFixed(0)}% of your income this month. Keep up the mindful spending!`;
  };

  const handleSendMoney = () => {
    const amount = parseFloat(payAmount);
    if (amount > 0 && payNote.trim()) {
      const assessment = generateAIAssessment(amount, payNote);
      setAiAssessment(assessment);
      setShowAIModal(true);
    }
  };

  const confirmTransaction = () => {
    const amount = parseFloat(payAmount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'sent',
      amount,
      note: payNote,
      date: 'Just now',
      recipient: 'Friend',
    };
    setTransactions([newTransaction, ...transactions]);
    setBalance((prev) => prev - amount);
    setPayAmount('');
    setPayNote('');
    setShowAIModal(false);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    setTimeout(() => {
      let response = '';
      const lower = userMessage.toLowerCase();

      if (lower.includes('spend') || lower.includes('spending')) {
        const total = transactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0);
        response = `This week you've spent $${total} across ${transactions.filter(t => t.type === 'sent').length} transactions. Your top categories are dining ($${weeklySpending.dining}) and entertainment ($${weeklySpending.entertainment}). You're trending 8% below your projected monthly spend - great discipline!`;
      } else if (lower.includes('save') || lower.includes('saving')) {
        response = `Based on your current balance of $${balance.toFixed(2)}, you could set aside $${(balance * 0.2).toFixed(0)} (20%) without impacting your daily spending. Your savings rate this month is looking healthy at 15% of income.`;
      } else if (lower.includes('invest') || lower.includes('bitcoin') || lower.includes('stock')) {
        response = `With $${balance.toFixed(2)} available, you have investment options:\n\n• Bitcoin: Currently volatile, consider $${Math.round(balance * 0.05)} position\n• Index Fund: Steady growth, great for the $${Math.round(balance * 0.1)} range\n\nYour risk profile suggests a 70/30 stocks-to-crypto allocation.`;
      } else if (lower.includes('budget') || lower.includes('money left')) {
        response = `Your discretionary budget: $${(balance * 0.4).toFixed(0)} remaining for flexible spending this month. Essential expenses are covered. You have a 3-month emergency fund buffer.`;
      } else {
        response = `I'm analyzing your financial patterns. Your balance is $${balance.toFixed(2)} with ${transactions.length} recent transactions. You're maintaining healthy spending habits. Would you like insights on dining, savings, investing, or budgeting?`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[850px] bg-black rounded-[40px] shadow-2xl shadow-black/50 border border-cash-border/30 overflow-hidden relative flex flex-col">
        {/* Status Bar */}
        <div className="h-12 flex items-center justify-between px-6 pt-2">
          <span className="text-white text-sm font-medium">9:41</span>
          <div className="w-24 h-6 bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 border border-white rounded-sm" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-sm" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeTab balance={balance} />}
          {activeTab === 'activity' && <ActivityTab transactions={transactions} />}
          {activeTab === 'pay' && (
            <PayTab
              payAmount={payAmount}
              payNote={payNote}
              setPayNote={setPayNote}
              handleKeypadPress={handleKeypadPress}
              handleSendMoney={handleSendMoney}
            />
          )}
          {activeTab === 'ai' && (
            <AITab
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleChatSend={handleChatSend}
              chatEndRef={chatEndRef}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="h-24 bg-cash-black border-t border-cash-border/30 flex items-center justify-around px-2 pb-6">
          <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={Clock} label="Activity" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
          <NavButton icon={CreditCard} label="Pay" active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} highlight />
          <NavButton icon={Sparkles} label="PaySense" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        {/* AI Assessment Modal */}
        {showAIModal && (
          <AIModal
            assessment={aiAssessment}
            payAmount={payAmount}
            payNote={payNote}
            onClose={() => setShowAIModal(false)}
            onConfirm={confirmTransaction}
          />
        )}
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button onClick={onClick} className="nav-item">
      {highlight ? (
        <div className="w-14 h-14 bg-cash-green rounded-full flex items-center justify-center mb-1 glow-green transition-transform active:scale-90">
          <Icon className="w-6 h-6 text-black" />
        </div>
      ) : (
        <Icon className={`w-6 h-6 ${active ? 'text-cash-green' : 'text-white/60'} transition-colors`} />
      )}
      <span className={`text-xs ${active ? 'text-cash-green font-medium' : 'text-white/50'} transition-colors`}>
        {label}
      </span>
    </button>
  );
}

function HomeTab({ balance }: { balance: number }) {
  return (
    <div className="flex flex-col h-full overflow-auto px-6 py-4 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cash-green to-cash-green-dark flex items-center justify-center">
          <span className="text-black font-bold text-lg">JD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm">John Doe</span>
        </div>
      </div>

      {/* Balance Card */}
      <div className="text-center mb-8">
        <p className="text-white/50 text-sm mb-2">Available Balance</p>
        <h1 className="text-5xl font-bold text-white tracking-tight">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 card-glass p-4 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-cash-green/10 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-cash-green" />
          </div>
          <span className="text-white text-sm font-medium">Add Cash</span>
        </button>
        <button className="flex-1 card-glass p-4 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.98]">
          <div className="w-12 h-12 rounded-full bg-cash-green/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-cash-green" />
          </div>
          <span className="text-white text-sm font-medium">Cash Out</span>
        </button>
      </div>

      {/* Investment Card */}
      <div className="card-glass p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-white font-medium">Bitcoin</p>
              <p className="text-white/50 text-xs">Pre-approved limit</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">$2,500</p>
            <p className="text-cash-green text-sm">Ready to invest</p>
          </div>
          <button className="px-5 py-2 bg-cash-green text-black font-semibold rounded-full transition-all active:scale-95">
            Buy Now
          </button>
        </div>
      </div>

      {/* Index Fund Card */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cash-green/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cash-green" />
            </div>
            <div>
              <p className="text-white font-medium">S&P 500 Index</p>
              <p className="text-white/50 text-xs">Diversified growth</p>
            </div>
          </div>
          <span className="text-cash-green text-sm font-medium">+12.4%</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">$5,000</p>
            <p className="text-white/50 text-sm">YTD Performance</p>
          </div>
          <button className="px-5 py-2 bg-white/10 text-white font-medium rounded-full border border-white/20 transition-all active:scale-95">
            Invest
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/30 text-xs">FDIC Insured up to $250,000</p>
      </div>
    </div>
  );
}

function ActivityTab({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-cash-border/30">
        <h2 className="text-2xl font-bold text-white">Activity</h2>
        <p className="text-white/50 text-sm">Recent transactions</p>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-4 border-b border-cash-border/20">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'received' ? 'bg-cash-green/20' : 'bg-white/10'}`}>
                {tx.type === 'received' ? (
                  <ArrowDownLeft className="w-5 h-5 text-cash-green" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-white/70" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{tx.note}</p>
                <p className="text-white/40 text-sm">{tx.date} • {tx.recipient}</p>
              </div>
            </div>
            <span className={`text-lg font-semibold ${tx.type === 'received' ? 'text-cash-green' : 'text-white'}`}>
              {tx.type === 'received' ? '+' : '-'}${tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayTab({ payAmount, payNote, setPayNote, handleKeypadPress, handleSendMoney }: {
  payAmount: string;
  payNote: string;
  setPayNote: (note: string) => void;
  handleKeypadPress: (value: string) => void;
  handleSendMoney: () => void;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 text-center">
        <h2 className="text-lg font-medium text-white/80">Payment Amount</h2>
      </div>

      {/* Amount Display */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center">
          <span className="text-white/50 text-4xl">$</span>
          <span className="text-6xl font-light text-white tracking-tight">
            {payAmount || '0'}
          </span>
        </div>
        <div className="mt-4 px-8">
          <input
            type="text"
            placeholder="What's it for?"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            className="w-full bg-cash-card border border-cash-border/50 rounded-xl px-4 py-3 text-white text-center placeholder:text-white/40 focus:outline-none focus:border-cash-green/50 transition-colors"
          />
        </div>
      </div>

      {/* Keypad */}
      <div className="flex-1 flex flex-col justify-center pb-4">
        <div className="grid grid-cols-3 gap-2 px-6">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              className="keypad-button"
            >
              {key === 'del' ? (
                <span className="text-sm text-white/60">del</span>
              ) : (
                key
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 px-6">
          <button
            onClick={handleSendMoney}
            disabled={!payAmount || parseFloat(payAmount) <= 0 || !payNote.trim()}
            className="w-full py-4 rounded-full font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-cash-green text-black active:scale-[0.98]"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}

function AITab({ chatMessages, chatInput, setChatInput, handleChatSend, chatEndRef }: {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleChatSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-cash-border/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cash-green/30 to-cash-green/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-cash-green" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">PaySense AI</h2>
          <p className="text-cash-green text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-cash-green rounded-full animate-pulse-green"></span>
            Online
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-cash-green text-black rounded-br-md'
                  : 'bg-cash-card text-white rounded-bl-md border border-cash-border/30'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-cash-border/30">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask about your spending..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            className="flex-1 bg-cash-card border border-cash-border/50 rounded-full px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cash-green/50 transition-colors"
          />
          <button
            onClick={handleChatSend}
            className="w-12 h-12 bg-cash-green rounded-full flex items-center justify-center transition-all active:scale-95"
          >
            <Send className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AIModal({ assessment, payAmount, payNote, onClose, onConfirm }: {
  assessment: string;
  payAmount: string;
  payNote: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in z-50">
      <div className="w-full max-w-[400px] bg-cash-card rounded-t-[32px] p-6 pb-10 animate-slide-up border-t border-cash-border/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cash-green/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cash-green" />
            </div>
            <div>
              <h3 className="text-white font-semibold">PaySense AI Assessment</h3>
              <p className="text-white/50 text-xs">Analyzing your transaction</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="bg-black/40 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">You're about to send</p>
              <p className="text-2xl font-bold text-white">${parseFloat(payAmount).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-sm">For</p>
              <p className="text-white font-medium">{payNote}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-6">
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{assessment}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-full font-medium bg-white/10 text-white border border-white/20 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-full font-semibold bg-cash-green text-black transition-all active:scale-[0.98]"
          >
            Confirm Pay
          </button>
        </div>
      </div>
    </div>
  );
}
