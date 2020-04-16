/* 
  index.js 
  Author: Rakshit Kumar
  Last Modified: April 17th 2020 
*/

const variantsUrl = "https://cfw-takehome.developers.workers.dev/api/variants";
const cookieName = "URL_VARIANT";

addEventListener("fetch", async (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleURL(url) {
  if (!url) return null;
  try {
    return await fetch(url);
  } catch (e) {
    console.log("The following error was encountered: ", e);
    return null;
  }
}

function checkCookies(request) {
  let value = null;
  let cookiesHeader = request.headers.get("Cookie");
  if (cookiesHeader) {
    const cookies = cookiesHeader.split(";");
    cookies.forEach((cookie) => {
      if (cookie.split("=")[0].trim() === cookieName) {
        value = cookie.split("=")[1];
      }
    });
  }
  return value;
}

async function handleRequest(request) {
  let url = checkCookies(request);
  if (!url) {
    try {
      await fetch(variantsUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          url = data.variants[Math.floor(Math.random() * 2)];
        });
    } catch (e) {
      console.log("The following error was encountered: ", e);
    }
  }

  urlResponse = await handleURL(url);

  try {
    let response = new Response(urlResponse.body, {
      status: urlResponse.status,
      statsText: urlResponse.statusText,
      headers: {
        "Set-Cookie": `${cookieName}=${url}`,
      },
    });
    response = handleHTMLRewriter(response);
    return response;
  } catch {
    return new Response("An error was encountered while rewriting the template!", {
      headers: { "content-type": "text/plain" },
    });
  }
}

async function handleHTMLRewriter(oldResponse) {
  const newResponse = new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent("Rakshit Kumar");
      },
    })
    .on("h1#title", {
      element(element) {
        element.setInnerContent("Rakshit Kumar");
      },
    })
    .on("p#description", {
      element(element) {
        element.setInnerContent("A computer science undergraduate and beyond!");
      },
    })
    .on("a#url", {
      element(element) {
        element.setAttribute("href", "http://rakshitcv.000webhostapp.com");
        element.setAttribute("target", "_blank");
        element.setInnerContent("Click here to open portfolio website.");
      },
    })
    .transform(oldResponse);

  return newResponse;
}