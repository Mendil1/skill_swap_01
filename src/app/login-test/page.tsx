"use client";

export default function LoginTest() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    console.log("=== BEFORE LOGIN TEST ===");
    console.log("Cookies before:", document.cookie);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Login response:", result);

      console.log("=== AFTER LOGIN TEST ===");
      console.log("Cookies after:", document.cookie);
      if (result.success) {
        alert("Login successful! Redirecting to profile...");
        // Wait a moment for cookies to be set, then redirect
        setTimeout(() => {
          window.location.href = "/profile";
        }, 500);
      } else {
        alert("Login failed: " + result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login error: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login Test v2</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            defaultValue="360z8@ptct.net"
            required
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            defaultValue="000000"
            required
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>
          Login Test v2
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            console.log("Current cookies:", document.cookie);
            alert("Check console for current cookies");
          }}
        >
          Check Current Cookies
        </button>
      </div>
    </div>
  );
}
