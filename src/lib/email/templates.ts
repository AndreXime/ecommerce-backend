import environment from "@/lib/environment";
import type { AbandonedCartItem, PromotionProduct } from "./types";

const FRONTEND = environment.FRONTEND_URL;

// ─── Blocos reutilizáveis ─────────────────────────────────────────────────────

function buttonHtml(href: string, label: string) {
	return `<p style="text-align:center;margin-top:24px">
    <a href="${href}" style="display:inline-block;padding:12px 32px;background:#111;color:#fff;
      text-decoration:none;border-radius:6px;font-weight:bold">${label}</a>
  </p>`;
}

function footerHtml() {
	return `<p style="font-size:12px;color:#999;text-align:center;margin-top:32px">
    Você recebe este email por ser cadastrado em nossa loja.<br/>
    <a href="${FRONTEND}" style="color:#999">Descadastrar</a>
  </p>`;
}

function wrapper(content: string) {
	return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">${content}</div>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function welcomeTemplate(name: string) {
	return wrapper(`
    <h2>Olá, ${name}!</h2>
    <p>Sua conta foi criada com sucesso. Seja bem-vindo à nossa loja!</p>
    ${buttonHtml(`${FRONTEND}/products`, "Explorar produtos")}
  `);
}

export function forgotPasswordTemplate(name: string, resetLink: string) {
	return wrapper(`
    <h2>Olá, ${name}!</h2>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
    ${buttonHtml(resetLink, "Redefinir senha")}
    <p style="color:#555">Este link expira em <strong>1 hora</strong>.</p>
    <p style="color:#999;font-size:13px">Se você não solicitou isso, ignore este email.</p>
  `);
}

function promotionCardHtml(p: PromotionProduct) {
	const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	const final = p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
	const badge = p.discountPercentage
		? `<span style="background:#e11d48;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">
        -${p.discountPercentage}%</span>`
		: "";
	const originalPrice = p.discountPercentage ? `<s style="color:#999;font-size:13px">${fmt(p.price)}</s> ` : "";

	return `<td style="width:45%;padding:8px;vertical-align:top;text-align:center">
    <a href="${FRONTEND}/products/${p.id}" style="text-decoration:none;color:inherit">
      <img src="${p.image}" alt="${p.name}" width="160" height="160"
        style="object-fit:cover;border-radius:8px;display:block;margin:0 auto" />
      <p style="margin:8px 0 4px;font-weight:600;font-size:14px">${p.name}</p>
      ${badge}
      <p style="margin:4px 0">${originalPrice}<strong>${fmt(final)}</strong></p>
    </a>
  </td>`;
}

export function promotionTemplate(name: string, products: PromotionProduct[]) {
	const rows: string[] = [];
	for (let i = 0; i < products.length; i += 2) {
		const right = products[i + 1] ? promotionCardHtml(products[i + 1]) : "<td></td>";
		rows.push(`<tr>${promotionCardHtml(products[i])}${right}</tr>`);
	}

	return wrapper(`
    <h2 style="margin-bottom:4px">Olá, ${name}!</h2>
    <p style="color:#555;margin-top:0">Confira as ofertas que separamos para você hoje:</p>
    <table style="width:100%;border-spacing:12px">${rows.join("")}</table>
    ${buttonHtml(`${FRONTEND}/products`, "Ver todos os produtos")}
    ${footerHtml()}
  `);
}

function abandonedCartItemHtml(item: AbandonedCartItem) {
	const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #eee">
      <table style="width:100%"><tr>
        <td style="width:64px">
          <img src="${item.image}" alt="${item.name}" width="56" height="56"
            style="object-fit:cover;border-radius:6px;display:block" />
        </td>
        <td style="padding-left:12px">
          <p style="margin:0;font-weight:600">${item.name}</p>
          <p style="margin:4px 0 0;color:#555;font-size:13px">
            Qtd: ${item.quantity} &nbsp;·&nbsp; ${fmt(item.price)} / un
          </p>
        </td>
        <td style="text-align:right;font-weight:bold">
          ${fmt(item.price * item.quantity)}
        </td>
      </tr></table>
    </td>
  </tr>`;
}

export function abandonedCartTemplate(name: string, items: AbandonedCartItem[]) {
	const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
	const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

	return wrapper(`
    <h2>Olá, ${name}! Você esqueceu algo.</h2>
    <p style="color:#555">Seu carrinho está esperando por você:</p>
    <table style="width:100%">${items.map(abandonedCartItemHtml).join("")}</table>
    <p style="text-align:right;font-weight:bold;margin-top:12px">
      Total: ${fmt(total)}
    </p>
    ${buttonHtml(`${FRONTEND}/cart`, "Voltar ao carrinho")}
    ${footerHtml()}
  `);
}
