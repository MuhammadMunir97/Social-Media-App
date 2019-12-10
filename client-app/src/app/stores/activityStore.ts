import {observable, action, computed, configure, runInAction} from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure ({enforceActions: 'always'});

class ActivityStore{
    @observable activityRegistery = new Map();
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
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

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity) {
            this.activity = activity;
        }else{
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    this.selectActivity = activity;
                    this.loadingInitial = false;
                })
            } catch (error) {
                runInAction('get activity error' , () => {
                    this.loadingInitial = false;
                })
                console.log(error);
            }
        }
    }

    getActivity = (id: string) => {
        return this.activityRegistery.get(id);
    }
    
    @action cleanActivity = () => {
        this.activity = null;
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction('create activity', () => {
                this.activityRegistery.set(activity.id, activity);
                this.submitting = false;
            })
        } catch (error) {
            runInAction('create activity error', () => {
                this.submitting = false;
            })
            console.log(error)
        }
    }

    @action selectActivity = (id: string) =>  {
        this.activity = this.activityRegistery.get(id);
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction('edit activity', () => {
                this.activityRegistery.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            })
        } catch (error) {
            runInAction('edit activity error', () => {
                this.submitting = false;
            })
            console.log(error);
        }
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