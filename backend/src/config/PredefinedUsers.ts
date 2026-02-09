
import { userInfoService } from '../services/UserInfoService';

export const insertPredefinedUsers = async () => {
    try {
        const users = [
            {
                username: 'admin',
                password: 'adminpw',
                mspId: 'Org1MSP',
            },
            {
                username: 'admin',
                password: 'adminpw',
                mspId: 'Org2MSP',
            }
        ];

        for (const user of users) {
            const exists = await userInfoService.findByUsername(user.username, user.mspId);
            if (!exists) {
                console.log(`Seeding user: ${user.username} (${user.mspId})`);
                await userInfoService.addUser(user);
            } else {
                console.log(`User already exists: ${user.username} (${user.mspId})`);
            }
        }
        console.log('Predefined users check complete.');
    } catch (error) {
        console.error('Error seeding predefined users:', error);
    }
};
