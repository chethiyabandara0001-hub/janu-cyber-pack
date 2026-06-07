async function run() {
  console.log("Calling restore API...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/restore-defaults", {
      method: "POST",
      headers: {
        "X-Requester-Uid": "admin-master-account"
      }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.error(e);
  }
}

run();
