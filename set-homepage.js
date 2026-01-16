const fs = require("fs")
const path = require("path")

const homepage = process.env.REACT_APP_BASE_PREFIX || "";
const pkgPath = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.homepage = homepage.endsWith("/") ? homepage.slice(0, -1) : homepage;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
