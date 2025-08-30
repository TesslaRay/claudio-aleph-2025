// hono
import { Context } from "hono";

// controller
export const healthController = {
  // get basic health status
  getStatus: (c: Context) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      timestampChile: new Date().toLocaleString("es-CL", {
        timeZone: "America/Santiago",
      }),
      timestampArgentina: new Date().toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      timestampColombia: new Date().toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      timestampVenezuela: new Date().toLocaleString("es-VE", {
        timeZone: "America/Caracas",
      }),
      timestampBolivia: new Date().toLocaleString("es-BO", {
        timeZone: "America/La_Paz",
      }),
      timestampMexico: new Date().toLocaleString("es-MX", {
        timeZone: "America/Mexico_City",
      }),
      timestampPeru: new Date().toLocaleString("es-PE", {
        timeZone: "America/Lima",
      }),
      uptime: process.uptime(),
    });
  },
};
