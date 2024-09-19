import { Server, Plugin, Request, ResponseToolkit } from '@hapi/hapi';

const plugin: Plugin<any> = {
  register: async function (server:Server, options:any) {
    server.route([
      {
        method: "GET",
        path: "/",
        options: {
          plugins: {
            policies: [],
          },
          tags: [],
          handler: async (request:Request, h:ResponseToolkit) => {
            return h.response({
              up: new Date().getTime() - request.server.info.started,
            });
          },
        },
      },
    ]);
  },
  version: "1.0.0",
  name: "root-routes",
};

export default plugin;