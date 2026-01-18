export async function generatePlan(data) {
    const res = await fetch("http://127.0.0.1:5000/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}
