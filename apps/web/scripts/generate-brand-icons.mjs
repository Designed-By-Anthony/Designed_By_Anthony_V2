import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const webPublic = path.join(webRoot, "public");
const adminPublic = path.join(webRoot, "..", "admin", "public");

/** Canonical vector mark — `public/icon.svg` (synced to `favicon.svg` + admin). */
const iconSvgPath = path.join(webPublic, "icon.svg");
const faviconSvgPath = path.join(webPublic, "favicon.svg");

function readMasterSvg() {
	if (!fs.existsSync(iconSvgPath)) {
		throw new Error(`Missing ${iconSvgPath}`);
	}
	const svg = fs.readFileSync(iconSvgPath);
	fs.writeFileSync(faviconSvgPath, svg);
	return svg;
}

async function toPng(svgBuffer, size) {
	return sharp(svgBuffer).resize(size, size).png().toBuffer();
}

async function main() {
	const svg = readMasterSvg();

	const buf16 = await toPng(svg, 16);
	const buf32 = await toPng(svg, 32);
	const ico = await pngToIco([buf16, buf32]);

	for (const dir of [webPublic, adminPublic]) {
		fs.mkdirSync(dir, { recursive: true });
	}

	fs.writeFileSync(path.join(webPublic, "favicon.ico"), ico);
	fs.writeFileSync(path.join(adminPublic, "favicon.ico"), ico);

	fs.writeFileSync(path.join(webPublic, "favicon.png"), buf32);
	fs.writeFileSync(path.join(adminPublic, "favicon.png"), buf32);

	const buf180 = await toPng(svg, 180);
	fs.writeFileSync(path.join(webPublic, "apple-touch-icon.png"), buf180);
	fs.writeFileSync(path.join(adminPublic, "apple-touch-icon.png"), buf180);
	fs.writeFileSync(path.join(webPublic, "apple-touch-icon-180.png"), buf180);
	fs.writeFileSync(path.join(adminPublic, "apple-touch-icon-180.png"), buf180);

	for (const size of [48, 192, 512]) {
		const buf = await toPng(svg, size);
		const name = `site-icon-${size}.png`;
		fs.writeFileSync(path.join(webPublic, name), buf);
		fs.writeFileSync(path.join(adminPublic, name), buf);
	}

	fs.copyFileSync(iconSvgPath, path.join(adminPublic, "icon.svg"));
	fs.copyFileSync(iconSvgPath, path.join(adminPublic, "favicon.svg"));

	console.log(
		"Wrote favicon.ico, PNGs, synced favicon.svg from icon.svg, copied SVGs to apps/admin/public.",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
