"""Resend email sender."""
import asyncio
import logging
from typing import Optional

import resend

from core.config import RESEND_API_KEY, SENDER_EMAIL, ADMIN_NOTIFICATION_EMAIL, STORE_NOTIFICATION_EMAIL

logger = logging.getLogger(__name__)


def _order_email_html(order: dict) -> str:
    rows = "".join(
        f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #EAE6DF;">
            <div style="color:#2D332F;font-size:14px;">{it.get('name', '')}{' · ' + it['variation_name'] if it.get('variation_name') else ''}</div>
            <div style="color:#606962;font-size:12px;">SKU: {it.get('sku', '')}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #EAE6DF;text-align:right;color:#2D332F;font-size:14px;">
            {it.get('quantity', 0)} × {it.get('unit_price', 0):.2f} €
          </td>
        </tr>
        """
        for it in order.get("items", [])
    )
    addr = order.get("shipping_address", {}) or {}
    return f"""
    <div style="font-family:Manrope,Arial,sans-serif;background:#F9F8F6;padding:40px 20px;color:#2D332F;">
      <div style="max-width:560px;margin:0 auto;background:#FFFFFF;padding:40px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-family:Outfit,Arial,sans-serif;font-size:28px;letter-spacing:0.12em;color:#2D332F;font-weight:300;">ECOANDES</div>
          <div style="color:#6B826E;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;">Natural · BIO</div>
        </div>
        <h2 style="font-family:Outfit,Arial,sans-serif;font-weight:300;color:#2D332F;margin:24px 0 8px;">Gracias por tu pedido</h2>
        <p style="color:#606962;font-size:14px;line-height:1.6;">
          Hemos recibido tu pedido <strong>#{order.get('order_number', '')}</strong>.
          Pronto recibirás otro email cuando sea enviado.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px;">
          {rows}
        </table>
        <table style="width:100%;margin-top:16px;">
          <tr><td style="color:#606962;font-size:13px;padding:4px 0;">Subtotal</td>
              <td style="text-align:right;font-size:13px;color:#2D332F;">{order.get('subtotal', 0):.2f} €</td></tr>
          <tr><td style="color:#606962;font-size:13px;padding:4px 0;">Envío</td>
              <td style="text-align:right;font-size:13px;color:#2D332F;">{order.get('shipping_cost', 0):.2f} €</td></tr>
          <tr><td style="color:#2D332F;font-size:16px;padding:12px 0;border-top:1px solid #EAE6DF;"><strong>Total</strong></td>
              <td style="text-align:right;font-size:16px;color:#2D332F;border-top:1px solid #EAE6DF;padding:12px 0;"><strong>{order.get('total', 0):.2f} €</strong></td></tr>
        </table>
        <h3 style="font-family:Outfit,Arial,sans-serif;font-weight:400;color:#2D332F;margin-top:32px;">Envío a</h3>
        <p style="color:#606962;font-size:13px;line-height:1.6;">
          {addr.get('full_name', '')}<br/>
          {addr.get('street', '')}<br/>
          {addr.get('postal_code', '')} {addr.get('city', '')}, {addr.get('province', '')}<br/>
          {addr.get('country', '')}
        </p>
        <p style="color:#9BA39D;font-size:11px;text-align:center;margin-top:40px;letter-spacing:0.1em;">
          Ecoandes · Productos ecológicos de los Andes
        </p>
      </div>
    </div>
    """


async def send_order_confirmation(order: dict) -> Optional[str]:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured; skipping order email.")
        return None
    resend.api_key = RESEND_API_KEY
    recipients = [order["email"]]
    bcc = [ADMIN_NOTIFICATION_EMAIL] if ADMIN_NOTIFICATION_EMAIL else []
    params = {
        "from": SENDER_EMAIL,
        "to": recipients,
        "subject": f"Confirmación de pedido #{order.get('order_number', '')} · Ecoandes",
        "html": _order_email_html(order),
    }
    if bcc:
        params["bcc"] = bcc
    try:
        resp = await asyncio.to_thread(resend.Emails.send, params)
        return resp.get("id") if isinstance(resp, dict) else None
    except Exception as e:
        logger.exception("Failed to send order email: %s", e)
        return None


def _pickup_email_html(order: dict) -> str:
    rows = "".join(
        f"""
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #EAE6DF;color:#2D332F;font-size:14px;">
            {it.get('name', '')}{' · ' + it['variation_name'] if it.get('variation_name') else ''}
            <span style="color:#9BA39D;"> (SKU: {it.get('sku', '')})</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #EAE6DF;text-align:right;color:#2D332F;font-size:14px;">
            x{it.get('quantity', 0)}
          </td>
        </tr>
        """
        for it in order.get("items", [])
    )
    addr = order.get("shipping_address", {}) or {}
    return f"""
    <div style="font-family:Manrope,Arial,sans-serif;background:#F9F8F6;padding:32px 20px;color:#2D332F;">
      <div style="max-width:560px;margin:0 auto;background:#FFFFFF;padding:36px;border-top:4px solid #6B826E;">
        <div style="color:#6B826E;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Recogida en tienda</div>
        <h2 style="font-family:Outfit,Arial,sans-serif;font-weight:400;color:#2D332F;margin:8px 0 4px;">Nuevo pedido para recoger</h2>
        <p style="color:#606962;font-size:14px;line-height:1.6;">
          Pedido <strong>#{order.get('order_number', '')}</strong> pagado por adelantado.
          El cliente pasará a recogerlo por la tienda.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">{rows}</table>
        <table style="width:100%;margin-top:12px;">
          <tr><td style="color:#2D332F;font-size:15px;padding:10px 0;border-top:1px solid #EAE6DF;"><strong>Total pagado</strong></td>
              <td style="text-align:right;font-size:15px;color:#2D332F;border-top:1px solid #EAE6DF;padding:10px 0;"><strong>{order.get('total', 0):.2f} €</strong></td></tr>
        </table>
        <h3 style="font-family:Outfit,Arial,sans-serif;font-weight:400;color:#2D332F;margin-top:24px;">Datos del cliente</h3>
        <p style="color:#606962;font-size:13px;line-height:1.6;">
          {addr.get('full_name', '')}<br/>
          {('Tel: ' + addr.get('phone')) if addr.get('phone') else ''}<br/>
          Email: {order.get('email', '')}
        </p>
      </div>
    </div>
    """


async def send_pickup_notification(order: dict) -> Optional[str]:
    """Notify the physical store that a paid pickup order is ready to prepare."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured; skipping pickup notification.")
        return None
    if not STORE_NOTIFICATION_EMAIL:
        logger.warning("STORE_NOTIFICATION_EMAIL not configured; skipping pickup notification.")
        return None
    resend.api_key = RESEND_API_KEY
    params = {
        "from": SENDER_EMAIL,
        "to": [STORE_NOTIFICATION_EMAIL],
        "subject": f"🛍️ Recogida en tienda · Pedido #{order.get('order_number', '')} · Ecoandes",
        "html": _pickup_email_html(order),
    }
    try:
        resp = await asyncio.to_thread(resend.Emails.send, params)
        return resp.get("id") if isinstance(resp, dict) else None
    except Exception as e:
        logger.exception("Failed to send pickup notification: %s", e)
        return None
