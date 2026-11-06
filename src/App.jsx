
import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import {
  createBankAccount,
  depositMoney,
  withdrawMoney,
  getBankAccount,
} from "./bankApi";
import "./App.css";

function App() {
  const auth = useAuth();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [startingBalance, setStartingBalance] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.id_token) {
      setAccount(null);
      setAccountLoading(true);
      setAccountError("");
      return;
    }

    let cancelled = false;

    setAccount(null);
    setAccountLoading(true);
    setAccountError("");

    getBankAccount(auth.user.id_token)
      .then((data) => {
        if (!cancelled) setAccount(data);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(error);
          setAccountError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setAccountLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user?.id_token]);

  async function createAccount(e) {
    e.preventDefault();

    const balanceCents = Math.round(Number(startingBalance) * 100);

    if (
      startingBalance.trim() === "" ||
      !Number.isSafeInteger(balanceCents) ||
      balanceCents < 0 ||
      balanceCents > 100000000
    ) {
      alert("Enter a valid starting balance.");
      return;
    }

    setSubmitting(true);

    try {
      await createBankAccount(
        auth.user.id_token,
        name,
        dob,
        balanceCents
      );

      const updated = await getBankAccount(auth.user.id_token);
      setAccount(updated);

      setName("");
      setDob("");
      setStartingBalance("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeposit(e) {
    e.preventDefault();

    const amountCents = Math.round(Number(depositAmount) * 100);

    if (
      depositAmount.trim() === "" ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 1000000
    ) {
      alert("Enter a valid deposit amount.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await depositMoney(
        auth.user.id_token,
        amountCents
      );

      setDepositAmount("");

      const updated = await getBankAccount(auth.user.id_token);
      setAccount(updated);

      alert(result.message);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();

    const amountCents = Math.round(Number(withdrawAmount) * 100);

    if (
      withdrawAmount.trim() === "" ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 1000000
    ) {
      alert("Enter a valid withdrawal amount.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await withdrawMoney(
        auth.user.id_token,
        amountCents
      );

      setWithdrawAmount("");

      const updated = await getBankAccount(auth.user.id_token);
      setAccount(updated);

      alert(result.message);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }
async function handleLogout() {
  const cognitoDomain =
    "https://us-east-171o99wmqj.auth.us-east-1.amazoncognito.com";

  const clientId = "12nlo0ctilrhlgg3ajjpmupvtv";

  const logoutUrl = new URL(`${cognitoDomain}/logout`);

  logoutUrl.searchParams.set("client_id", clientId);
  logoutUrl.searchParams.set(
    "logout_uri",
    window.location.origin + "/"
  );

  await auth.removeUser();
  window.location.replace(logoutUrl.toString());
}

  if (auth.isLoading) {
    return (
      <main className="banking-app">
        <p>Checking login...</p>
      </main>
    );
  }

  if (auth.error) {
    return (
      <main className="banking-app">
        <p>Login error: {auth.error.message}</p>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <main className="banking-app">
        <h1>Capital One Banking Demo</h1>
        <p>Welcome to your online banking experience.</p>

        <button onClick={() => auth.signinRedirect()}>
          Log In / Sign Up
        </button>
      </main>
    );
  }

  return (
    <main className="banking-app">
      <h1>Capital One Banking Demo</h1>

      <p>Logged in as: {auth.user?.profile.email}</p>

      <button onClick={handleLogout}>
        Log Out
      </button>

      <hr />

      {accountLoading ? (
        <p>Loading your bank account...</p>
      ) : accountError ? (
        <section>
          <h2>Unable to load your account</h2>
          <p>{accountError}</p>

          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </section>
      ) : !account ? (
        <section>
          <h2>Welcome! Let's Set Up Your Bank Account</h2>

          <p>
            Complete your information to open your first account.
          </p>

          <form onSubmit={createAccount}>
            <div className="form-field">
              <label htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={dob}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="starting-balance">
                Starting Balance ($)
              </label>
              <input
                id="starting-balance"
                type="number"
                step="0.01"
                min="0"
                max="1000000"
                placeholder="100.00"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </section>
      ) : (
        <section>
          <h2>Welcome Back, {account.fullName}!</h2>

          <div className="account-card">
            <h3>My Bank Account</h3>
            <p>Available Balance</p>

            <h1>${(account.balanceCents / 100).toFixed(2)}</h1>
          </div>

          <h2>Deposit Money</h2>

          <form onSubmit={handleDeposit} className="transaction-form">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              placeholder="Amount ($)"
              aria-label="Deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />

            <button type="submit" disabled={submitting}>
              Deposit
            </button>
          </form>

          <h2>Withdraw Money</h2>

          <form onSubmit={handleWithdraw} className="transaction-form">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              placeholder="Amount ($)"
              aria-label="Withdrawal amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              required
            />

            <button type="submit" disabled={submitting}>
              Withdraw
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

export default App;
