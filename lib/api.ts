// API client utilities for frontend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchDashboardData() {
    const res = await fetch(`${API_BASE}/api/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
}

export async function logActivity(data: {
    type: 'exercise' | 'meditation' | 'nutrition';
    name: string;
    duration: number;
    intensity?: 'low' | 'moderate' | 'high';
    calories?: number;
    notes?: string;
}) {
    const res = await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log activity');
    return res.json();
}

export async function fetchActivities(limit = 20) {
    const res = await fetch(`${API_BASE}/api/activities?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
}

export async function createPost(content: string, category = 'general') {
    const res = await fetch(`${API_BASE}/api/social/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category }),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
}

export async function fetchPosts(limit = 20) {
    const res = await fetch(`${API_BASE}/api/social/posts?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
}

export async function toggleLike(postId: string) {
    const res = await fetch(`${API_BASE}/api/social/posts/${postId}/like`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
}

export async function enrollInChallenge(challengeId: string) {
    const res = await fetch(`${API_BASE}/api/challenges/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
    });
    if (!res.ok) throw new Error('Failed to enroll');
    return res.json();
}

export async function fetchChallenges() {
    const res = await fetch(`${API_BASE}/api/challenges`);
    if (!res.ok) throw new Error('Failed to fetch challenges');
    return res.json();
}

export async function fetchUserChallenges(status?: string) {
    const url = status
        ? `${API_BASE}/api/challenges/enroll?status=${status}`
        : `${API_BASE}/api/challenges/enroll`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch user challenges');
    return res.json();
}

export async function fetchMLPredictions(userId: string) {
    const res = await fetch(`${API_BASE}/api/ml/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to fetch ML predictions');
    return res.json();
}

export async function fetchLeaderboard(limit = 10) {
    const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
}

export async function fetchQuantumPrediction(userProfile: any) {
    const res = await fetch(`${API_BASE}/api/ml/dropout-quantum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
    });
    if (!res.ok) {
        const error = await res.json();
        if (error.available === false) {
            return null; // Quantum service not available
        }
        throw new Error('Failed to fetch quantum prediction');
    }
    return res.json();
}

export async function compareMLModels(userProfile: any) {
    const res = await fetch(`${API_BASE}/api/ml/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
    });
    if (!res.ok) throw new Error('Failed to compare ML models');
    return res.json();
}
