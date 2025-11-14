
export const generateChangeLog = <T extends object>(oldData: T, newData: T, labels: Record<keyof T, string>): string => {
    const changes: string[] = [];

    for (const key in newData) {
        const typedKey = key as keyof T;
        const oldValue = oldData[typedKey];
        const newValue = newData[typedKey];

        const formatValue = (value: any) => {
            if (Array.isArray(value)) return value.join(', ');
            if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
            return value;
        };

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push(`${labels[typedKey]} alterado de "${formatValue(oldValue)}" para "${formatValue(newValue)}".`);
        }
    }

    return changes.join('\n');
};
