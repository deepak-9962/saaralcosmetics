const fs = require('fs');

const filePath = 'c:/Users/DEEPAK/saaral/src/components/home/CustomerTransformations.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update interface using regex
const interfaceRegex = /(interface\s+Transformation\s*\{[\s\S]*?productHref:\s*string;)/;
if (interfaceRegex.test(content)) {
  content = content.replace(interfaceRegex, `$1\r\n  product1Label: string;`);
} else {
  console.log('Interface regex failed!');
}

// 2. Update TRANSFORMATIONS items (already handled by the other script but let's make sure it's clean)
const oldChitra = `customer: "Chitra",
    location: "Chennai, Tamil Nadu",
    duration: "6 weeks",
    product: "Skin Whitening Cream + Redwine Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Face Wash",`;

const newChitra = `customer: "Chitra",
    location: "Chennai, Tamil Nadu",
    duration: "6 weeks",
    product: "Skin Whitening Cream + Redwine Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    product1Label: "Whitening Cream",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Wash",`;

content = content.replace(oldChitra.replace(/\r?\n/g, '\r\n'), newChitra.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldChitra.replace(/\r?\n/g, '\n'), newChitra.replace(/\r?\n/g, '\n'));

const oldKavitha = `customer: "Kavitha",
    location: "Madurai, Tamil Nadu",
    duration: "10 weeks",
    product: "Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Butterfly Pea Face Wash",`;

const newKavitha = `customer: "Kavitha",
    location: "Madurai, Tamil Nadu",
    duration: "10 weeks",
    product: "Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product1Label: "Anti-Aging Cream",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Sangupoo Wash",`;

content = content.replace(oldKavitha.replace(/\r?\n/g, '\r\n'), newKavitha.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldKavitha.replace(/\r?\n/g, '\n'), newKavitha.replace(/\r?\n/g, '\n'));

const oldPrema = `customer: "Prema",
    location: "Thirupathi, Andhra Pradesh",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product2Label: "Anti Aging Cream",`;

const newPrema = `customer: "Prema",
    location: "Thirupathi, Andhra Pradesh",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    product1Label: "Whitening Cream",
    productHref2: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product2Label: "Anti-Aging Cream",`;

content = content.replace(oldPrema.replace(/\r?\n/g, '\r\n'), newPrema.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldPrema.replace(/\r?\n/g, '\n'), newPrema.replace(/\r?\n/g, '\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('Regex update successful!');
