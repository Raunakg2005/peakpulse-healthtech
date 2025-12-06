export interface Avatar {
    id: string;
    imageUrl: string;
    name: string;
}

export const AVATARS: Avatar[] = [
    // Male avatars
    {
        id: 'boy_1',
        imageUrl: '/avatars/boy_1.png',
        name: 'Avatar 1'
    },
    {
        id: 'boy_2',
        imageUrl: '/avatars/boy_2.png',
        name: 'Avatar 2'
    },
    {
        id: 'boy_3',
        imageUrl: '/avatars/boy_3.png',
        name: 'Avatar 3'
    },

    // Female avatars
    {
        id: 'girl_1',
        imageUrl: '/avatars/girl_1.png',
        name: 'Avatar 4'
    },
    {
        id: 'girl_2',
        imageUrl: '/avatars/girl_2.png',
        name: 'Avatar 5'
    },
    {
        id: 'girl_3',
        imageUrl: '/avatars/girl_3.png',
        name: 'Avatar 6'
    }
];

export function getAvatarById(id: string): Avatar | undefined {
    return AVATARS.find(avatar => avatar.id === id);
}

export function getDefaultAvatar(): Avatar {
    return AVATARS[0];
}
