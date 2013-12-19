from django import forms

class QueryForm(forms.Form):
    account = forms.CharField(max_length=100)
    days = forms.IntegerField(max_value=10000, min_value=0)
