fetch("http://localhost:3000/api/admin/emergency-repair?key=reset123").then(res => res.text()).then(console.log).catch(console.error);
