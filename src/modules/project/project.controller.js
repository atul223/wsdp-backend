
const prisma = require('../../config/db');

async function listProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects
};