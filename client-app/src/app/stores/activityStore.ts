import {observable, action, computed, configure, runInAction} from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure ({enforceActions: 'always'});

class ActivityStore{
    @observable activityRegistery = new Map();
    @observable activities: IActivity[] = [];
    @observable selectedActivity: IActivity | undefined;
    @observable loadingInitial = false;
    @observable editMode = false;
    @observable submitting = false;

    @computed get activitiesByDate(){
        return Array.from(this.activityRegistery.values()).sort(((a, b) => Date.parse(a.date) - Date.parse(b.date)));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction('loading Activities', () => {
                activities.forEach((activity) => {
                    activity.date = activity.date.split('.')[0]
                    this.activityRegistery.set(activity.id,activity);
                });
                this.loadingInitial = false;
            });
        } catch (error) {
            runInAction('load activities error', () => {
                this.loadingInitial = false;
            })
            console.log(error);
        };
    }
    
    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction('create activity', () => {
                this.activityRegistery.set(activity.id, activity);
                this.editMode = false;
                this.submitting = false;
            })
        } catch (error) {
            runInAction('create activity error', () => {
                this.submitting = false;
            })
            console.log(error)
        }
    }

    @action openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    }

    @action selectActivity = (id: string) =>  {
        this.editMode = false;
        this.selectedActivity = this.activityRegistery.get(id);
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction('edit activity', () => {
                this.activityRegistery.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.submitting = false;
            })
        } catch (error) {
            runInAction('edit activity error', () => {
                this.submitting = false;
            })
            console.log(error);
        }
    }

    @action openEditForm = (id: string) => {
        this.selectActivity = this.activityRegistery.get(id);
        this.editMode = true;
    }

    @action cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    @action cancelFormOpen = () => {
        this.editMode = false;
    }

    @action deleteActivity = async (id: string) => {
        try {
            this.submitting = true;
            await  agent.Activities.delete(id);
            runInAction('delete activity',() => {
                this.activityRegistery.delete(id);
                this.submitting = false;
            })
        } catch (error) {
            runInAction('delete activity error',() => {
                this.submitting = false;
            })
            console.log(error);
        }
    }
}

export default createContext(new ActivityStore())