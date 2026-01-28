
import { OrganizationType, SubscriptionPlan, Gender } from '@/types/enums';

export const OrganizationTypeLabels: Record<OrganizationType | string, { FR: string; ENG: string }> = {
    [OrganizationType.OTHER]: { FR: 'Autre', ENG: 'Other' },
    [OrganizationType.ASSOCIATION]: { FR: 'Association', ENG: 'Association' },
    [OrganizationType.LLC]: { FR: 'SARL / EURL', ENG: 'LLC' },
    [OrganizationType.COOPERATIVE]: { FR: 'Coopérative', ENG: 'Cooperative' },
    [OrganizationType.SA]: { FR: 'SA / SAS', ENG: 'Corporation' },
    [OrganizationType.PUBLIC_ESTABLISHMENT]: { FR: 'Établissement Public', ENG: 'Public Establishment' },
    [OrganizationType.EIG]: { FR: 'GIE', ENG: 'EIG' },
};

export const SubscriptionPlanLabels: Record<SubscriptionPlan | string, { FR: string; ENG: string }> = {
    [SubscriptionPlan.BASIC]: { FR: 'Basique', ENG: 'Basic' },
    [SubscriptionPlan.PROFESSIONAL]: { FR: 'Professionnel', ENG: 'Professional' },
    [SubscriptionPlan.ENTERPRISE]: { FR: 'Entreprise', ENG: 'Enterprise' },
};

export const GenderLabels: Record<Gender | string, { FR: string; ENG: string }> = {
    [Gender.MALE]: { FR: 'Homme', ENG: 'Male' },
    [Gender.FEMALE]: { FR: 'Femme', ENG: 'Female' },
};
