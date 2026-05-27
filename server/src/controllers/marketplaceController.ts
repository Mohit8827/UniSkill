import { Request, Response } from 'express';
import { prisma } from '../index';

export const getMentors = async (req: Request, res: Response) => {
  const { query } = req.query;
  try {
    const mentors = await prisma.user.findMany({
      where: {
        isVerified: true,
        id: { not: (req as any).user.id },
        // Simple contains for SQLite prototype
        skills: { contains: query ? (query as string) : "" },
      },
      select: {
        id: true,
        name: true,
        college: true,
        skills: true,
        rating: true,
        numReviews: true,
      },
      take: 20
    });
    // If no specific skill query, just return random mentors
    if (!query) {
      const allMentors = await prisma.user.findMany({
        where: { isVerified: true, id: { not: (req as any).user.id } },
        select: { id: true, name: true, college: true, skills: true, rating: true, numReviews: true },
        take: 20
      });
      return res.json(allMentors);
    }
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors' });
  }
};

export const getSwapMatches = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    // For SQLite prototype, we simplify matching
    const matches = await prisma.user.findMany({
      where: {
        isVerified: true,
        id: { not: user.id },
      },
      select: {
        id: true,
        name: true,
        college: true,
        skills: true,
        interests: true,
      },
      take: 10
    });

    const formattedMatches = matches.map(m => ({
      id: m.id,
      name: m.name,
      college: m.college,
      matchSkill: m.skills, // Just show their skills
      wantSkill: m.interests // Just show their interests
    }));

    res.json(formattedMatches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching swap matches' });
  }
};

export const getMySessions = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ mentorId: user.id }, { studentId: user.id }]
      },
      include: {
        mentor: { select: { name: true, college: true } },
        student: { select: { name: true, college: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedSessions = sessions.map(s => ({
      id: s.id,
      skill: s.skill,
      startTime: s.startTime || s.createdAt,
      status: s.status,
      otherUser: s.mentorId === user.id ? s.student : s.mentor
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};
