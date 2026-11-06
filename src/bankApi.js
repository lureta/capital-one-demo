
const API_URL = "https://ufauqp5aw3.execute-api.us-east-1.amazonaws.com";

export async function createBankAccount(idToken, fullName, dob, balanceCents) {
  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
        fullName,
        dob,
        balanceCents
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export async function depositMoney(idToken, amountCents) {
  const response = await fetch(`${API_URL}/deposits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      amountCents,
      transactionId: crypto.randomUUID(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Deposit failed");
  }

  return data;
}

export async function withdrawMoney(idToken, amountCents) {
  const response = await fetch(`${API_URL}/withdrawals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      amountCents,
      transactionId: crypto.randomUUID(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Withdrawal failed");
  }

  return data;
}


export async function getBankAccount(idToken) {
  const response = await fetch(`${API_URL}/accounts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await response.json();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data.error || "Could not load account");
  }

  return data;
}
